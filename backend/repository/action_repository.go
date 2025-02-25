package repository

import (
	"context"
	"errors"
	"fmt"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/google/generative-ai-go/genai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"go.mongodb.org/mongo-driver/mongo"
)

type ActionRepository interface {
	UploadQuestions(ctx context.Context, questions []domain.Question, userID string) (string, error)
	UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error)
	UploadSection(ctx context.Context, section domain.Section) (string, error)
	QuizAnswer(ctx context.Context, quizID string, answer []domain.Answer) (int, bool, error)
	CreateExplanation(ctx context.Context, explanationID string, answers domain.AnswerList) (string, error)
	UpdateSection(ctx context.Context, section domain.Section) error
	GetPdfLink(ctx context.Context, file multipart.File, filename string) (string, error)

	CreateTopic(ctx context.Context, answerID, conversationID string) (string, error)

	UploadPDF(ctx context.Context, pdf domain.PDF) (string, error)
	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadForGemini(processedText string) ([]domain.ConversationTurn, error)
	FormatQeustion(question string) []domain.Question
}

type actionRepository struct {
	UserBooks        *mongo.Collection
	UserQuiz         *mongo.Collection
	UserConversation *mongo.Collection
	UserSections     *mongo.Collection
	UserAnswers      *mongo.Collection
	GeminiModel      *genai.GenerativeModel
	GeminiContext    context.Context
}

func NewActionRepository(db *mongo.Database, model *genai.GenerativeModel, ctx context.Context) ActionRepository {
	return &actionRepository{
		UserBooks:        db.Collection("pdf"),
		UserQuiz:         db.Collection("quiz"),
		UserConversation: db.Collection("conversation"),
		UserSections:     db.Collection("section"),
		UserAnswers:      db.Collection("answers"),
		GeminiContext:    ctx,
		GeminiModel:      model,
	}
}

func (r *actionRepository) GetPdfLink(ctx context.Context, file multipart.File, filename string) (string, error) {
	return infrastructure.UploadPDF(file, filename)

}

func (r *actionRepository) CreateTopic(ctx context.Context, answerID, conversationID string) (string, error) {

	var answer domain.AnswerList
	var conversation domain.Conversation

	ObjectID, err := primitive.ObjectIDFromHex(answerID)
	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	filters := bson.M{"_id": ObjectID}

	err = r.UserAnswers.FindOne(ctx, filters).Decode(&answer)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	ObjectID, err = primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	filters = bson.M{"_id": ObjectID}

	err = r.UserConversation.FindOne(ctx, filters).Decode(&conversation)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	if len(conversation.Turns) >= 3 {
		return "", errors.New("conversation already created")
	}

	answer_prompt := infrastructure.ParseAnswer(answer.Answers)

	curent_request := fmt.Sprintf(`Here is my answer \n
    %s \n

    For each question:
    1. If the answer is incorrect, Create a topic about it, Not why it is wrong
	2. The topic name not be the question title 
	3. The topic should be a weak point about the topic
	4. The Explanation should not include the answer
	5. The Explanation should be detailed and include other resources

    Example Format:
	Weak Point 1: Title of the topic.
	Explanation : Explanation of the topic, You can also include other resources. 
	
	Weak Point 2: Title of the topic
	Explanation : Explanation of the topic, You can also include other resources.

    `, answer_prompt)

	prompt := infrastructure.BuildPromptWithContext(curent_request, conversation.Turns[0:1])

	resp, err := r.GeminiModel.GenerateContent(r.GeminiContext, genai.Text(prompt))

	if err != nil {
		return "", fmt.Errorf("error generating content: %v", err)
	}

	gem_resp := infrastructure.ExtractGeminiResponse(resp)

	update := bson.M{"$push": bson.M{"conversation": domain.ConversationTurn{User: curent_request, Gemini: gem_resp}}}

	_, err = r.UserConversation.UpdateOne(ctx, filters, update)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	return "", nil

}

func (r *actionRepository) UpdateSection(ctx context.Context, section domain.Section) error {
	ObjectID, err := primitive.ObjectIDFromHex(section.ID.Hex())

	if err != nil {
		return errors.New("repository/action_repository: " + err.Error())
	}

	filters := bson.M{"_id": ObjectID}

	_, err = r.UserSections.ReplaceOne(ctx, filters, section)

	if err != nil {
		return errors.New("repository/action_repository: " + err.Error())
	}

	return nil
}

func (r *actionRepository) CreateExplanation(ctx context.Context, explanationID string, answers domain.AnswerList) (string, error) {

	ObjectID, err := primitive.ObjectIDFromHex(explanationID)
	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	answerID, err := r.UserAnswers.InsertOne(ctx, answers)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	filters := bson.M{"_id": ObjectID}

	var conversation domain.Conversation
	err = r.UserConversation.FindOne(ctx, filters).Decode(&conversation)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	answer_prompt := infrastructure.ParseAnswer(answers.Answers)

	curent_request := fmt.Sprintf(`Here is my answer \n
    %s \n

    For each question:

    1. Indicate whether the answer is correct or incorrect.
    2. If the answer is incorrect, provide the correct answer AND a detailed explanation of *why* the provided answer is wrong.
    3. If the answer is correct, simply state "Correct".

    Example Format:
    Question Number: [question number]
    Correct Answer: [correct answer]  (Only if the answer is incorrect)
    Your Answer: [user's answer]
    Correctness: [Correct/Incorrect]
    Explanation: [explanation] (Only if the answer is incorrect)

    `, answer_prompt)
	prompt := infrastructure.BuildPromptWithContext(curent_request, conversation.Turns)

	resp, err := r.GeminiModel.GenerateContent(r.GeminiContext, genai.Text(prompt))

	if err != nil {
		return "", fmt.Errorf("error generating content: %v", err)
	}

	gem_resp := infrastructure.ExtractGeminiResponse(resp)

	update := bson.M{"$push": bson.M{"conversation": domain.ConversationTurn{User: curent_request, Gemini: gem_resp}}}

	_, err = r.UserConversation.UpdateOne(ctx, filters, update)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	aID, ok := answerID.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("repository/action_repository: could not convert inserted id")
	}

	return aID.Hex(), nil
}

func (r *actionRepository) QuizAnswer(ctx context.Context, quizID string, answer []domain.Answer) (int, bool, error) {

	ObjectID, err := primitive.ObjectIDFromHex(quizID)

	if err != nil {
		return 0, false, errors.New("repository/action_repository: " + err.Error())
	}

	filters := bson.M{"_id": ObjectID}
	var score int = 0

	var quizes domain.Quiz
	err = r.UserQuiz.FindOne(ctx, filters).Decode(&quizes)

	if err != nil {
		return 0, false, errors.New("repository/action_repository: " + err.Error())
	}

	if !quizes.Taken {
		update := bson.M{"$set": bson.M{"taken": true}}

		_, err = r.UserQuiz.UpdateOne(ctx, filters, update)
		if err != nil {
			return 0, false, errors.New("repository/action_repository: " + err.Error())
		}

	}

	for index, quiz := range quizes.Questions {

		if quiz.Answer == answer[index].Answer {
			score++
		}

	}

	return score, quizes.Taken, nil
}

func (r *actionRepository) UploadSection(ctx context.Context, section domain.Section) (string, error) {
	sectionID, err := r.UserSections.InsertOne(ctx, section)
	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	insertedID, ok := sectionID.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("repository/action_repository: could not convert inserted id")
	}

	return insertedID.Hex(), nil
}

func (r *actionRepository) UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error) {

	var conv domain.Conversation
	conv.Turns = conversation

	conversationID, err := r.UserConversation.InsertOne(ctx, conv)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	insertedID, ok := conversationID.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("repository/action_repository: could not convert inserted id")
	}
	return insertedID.Hex(), nil
}

func (r *actionRepository) UploadQuestions(ctx context.Context, questions []domain.Question, userID string) (string, error) {

	var new_quiz domain.Quiz
	new_quiz.Questions = questions
	new_quiz.CreatedBy = userID
	new_quiz.Taken = false

	questionID, err := r.UserQuiz.InsertOne(ctx, new_quiz)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	insertedID, ok := questionID.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("repository/action_repository: could not convert inserted id")
	}
	return insertedID.Hex(), nil
}

func (r *actionRepository) ProcessPDF(ctx context.Context, link string) (string, error) {

	processedTextLink, err := infrastructure.ProcessPDF(link)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	textResponse, err := http.Get(processedTextLink)
	if err != nil {
		return "", fmt.Errorf("error downloading text: %w", err)
	}
	defer textResponse.Body.Close()

	if textResponse.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(textResponse.Body)
		return "", fmt.Errorf("error downloading text, status: %d, body: %s", textResponse.StatusCode, string(body))
	}

	textBytes, err := io.ReadAll(textResponse.Body)
	if err != nil {
		return "", fmt.Errorf("error reading downloaded text: %w", err)
	}

	extractedText := string(textBytes)
	return extractedText, nil

}

func (r *actionRepository) UploadForGemini(processedText string) ([]domain.ConversationTurn, error) {
	conversation := []domain.ConversationTurn{}
	prompt := fmt.Sprintf(`
			Generate 10 multiple-choice questions based on the following text.  Each question should have 4 alternatives (A, B, C, D) and indicate the correct answer.  
			Format the output precisely as shown in the example below.  
			Do not include any extra text or explanations.


			Dont include the example format in the output.

			
			Example Format: 
			1, What is the capital of France?
			A, London
			B, Paris
			C, Rome
			D, Berlin
			B

			2, What is the highest mountain in the world?
			A, K2
			B, Kangchenjunga
			C, Mount Everest
			D, Lhotse
			C
			

			Text:
			%s
			`, processedText)

	resp, err := r.GeminiModel.GenerateContent(r.GeminiContext, genai.Text(prompt))

	if err != nil {
		return []domain.ConversationTurn{}, fmt.Errorf("error generating content: %v", err)
	}

	gem_resp := infrastructure.ExtractGeminiResponse(resp)

	conversation = append(conversation, domain.ConversationTurn{User: prompt, Gemini: gem_resp})

	return conversation, nil
}
func (r *actionRepository) UploadPDF(ctx context.Context, pdf domain.PDF) (string, error) {
	id, err := r.UserBooks.InsertOne(ctx, pdf)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	insertedID, ok := id.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("repository/action_repository: could not convert inserted id")
	}
	return insertedID.Hex(), nil
}

func (r *actionRepository) FormatQeustion(question string) []domain.Question {
	qeustions := infrastructure.ParseQuestions(question)
	return qeustions
}
