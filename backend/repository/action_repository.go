package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ActionRepository interface {
	UploadPDF(ctx context.Context, pdf domain.PDF) (string, error)
	UploadQuestions(ctx context.Context, questions []domain.Question, userID string) (string, error)
	UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error)
	UploadSection(ctx context.Context, section domain.Section) error
	QuizAnswer(ctx context.Context, quizID string, userID string, answer []domain.Answer) (int, error)

	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadForGemini(processedText string) ([]domain.ConversationTurn, error)
	GetDropLink(ctx context.Context, filename string) (string, error)
	FormatQeustion(question string) []domain.Question
}

type actionRepository struct {
	UserBooks        *mongo.Collection
	UserQuiz         *mongo.Collection
	UserConversation *mongo.Collection
	UserSections     *mongo.Collection
	GeminiModel      *genai.GenerativeModel
	GeminiContext    context.Context
}

func NewActionRepository(db *mongo.Database, model *genai.GenerativeModel, ctx context.Context) ActionRepository {
	return &actionRepository{
		UserBooks:        db.Collection("pdf"),
		UserQuiz:         db.Collection("quiz"),
		UserConversation: db.Collection("conversation"),
		UserSections:     db.Collection("section"),
		GeminiContext:    ctx,
		GeminiModel:      model,
	}
}

func (r *actionRepository) QuizAnswer(ctx context.Context, quizID string, userID string, answer []domain.Answer) (int, error) {
	filters := bson.M{"_id": quizID, "CreatedBy": userID}
	var score int = 0

	var quizes domain.Quiz
	err := r.UserQuiz.FindOne(ctx, filters).Decode(&quizes)

	if err != nil {
		if err == mongo.ErrNoDocuments {

			return 0, errors.New("repository/action_repository: " + "Invalid Quiz ID")
		}
		return 0, errors.New("repository/action_repository: " + err.Error())
	}

	number := 0

	for index, quiz := range quizes.Questions {
		if quiz.Answer == answer[index].Answer {
			score++
		}

	}

	return number, nil
}

func (r *actionRepository) UploadSection(ctx context.Context, section domain.Section) error {
	_, err := r.UserSections.InsertOne(ctx, section)
	if err != nil {
		return errors.New("repository/action_repository: " + err.Error())
	}
	return nil
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
			Generate 20 multiple-choice questions based on the following text.  Each question should have 4 alternatives (A, B, C, D) and indicate the correct answer.  Format the output precisely as shown in the example below.  Do not include any extra text or explanations.

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

	fmt.Println(gem_resp)

	conversation = append(conversation, domain.ConversationTurn{User: prompt, Gemini: gem_resp})

	return conversation, nil
}

func (r *actionRepository) GetDropLink(ctx context.Context, filename string) (string, error) {
	url := "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings"
	reqBody := fmt.Sprintf(`{"path":"/%s","settings":{"requested_visibility":"public"}}`, filename)

	req, err := http.NewRequest("POST", url, bytes.NewReader([]byte(reqBody)))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	apiKey, exist := os.LookupEnv("DROPBOX_TOKEN")
	if !exist {
		return "", fmt.Errorf("error loading dropbox api key: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	// Read and handle the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response body: %v", err)
	}

	// If the request was successful, parse the shared link from the response
	var response map[string]interface{}
	err = json.Unmarshal(body, &response)
	if err != nil {
		return "", fmt.Errorf("error unmarshalling response: %v", err)
	}

	// Extract the URL from the response
	if link, exists := response["url"].(string); exists {
		link = strings.Replace(link, "https://www", "https://dl", -1)
		return link, nil
	}

	return "", fmt.Errorf("could not find URL in response")
}

func (r *actionRepository) FormatQeustion(question string) []domain.Question {
	qeustions := infrastructure.ParseQuestions(question)
	return qeustions
}
