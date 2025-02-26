package usecases

import (
	"context"
	"errors"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/repository"
	"mime/multipart"
)

type ActionUsecase interface {
	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadQuestions(ctx context.Context, questions []domain.Question, userID string) (string, error)
	UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error)
	UploadSection(ctx context.Context, section domain.Section) (string, error)
	UpdateSection(ctx context.Context, section domain.Section) error
	UploadPDF(ctx context.Context, pdf domain.PDF) (string, error)
	QuizAnswer(ctx context.Context, quiz_id string, answers []domain.Answer) (int, bool, error)

	CreateExplanation(ctx context.Context, quizID string, answers domain.AnswerList) (string, error)
	CreateTopic(ctx context.Context, answerID, conversationID string) (string, error)

	GetPdfLink(ctx context.Context, file multipart.File, filename string) (string, error)
	UploadForGemini(processed_text string) ([]domain.Question, []domain.ConversationTurn, error)
}

type actionUsecase struct {
	ActionRepository repository.ActionRepository
}

func NewActionUsecase(repo repository.ActionRepository) ActionUsecase {
	return &actionUsecase{
		ActionRepository: repo,
	}
}

func (a *actionUsecase) UploadPDF(ctx context.Context, pdf domain.PDF) (string, error) {
	return a.ActionRepository.UploadPDF(ctx, pdf)
}

func (a *actionUsecase) ProcessPDF(ctx context.Context, link string) (string, error) {
	return a.ActionRepository.ProcessPDF(ctx, link)
}

func (a *actionUsecase) CreateTopic(ctx context.Context, answerID, conversationID string) (string, error) {
	return a.ActionRepository.CreateTopic(ctx, answerID, conversationID)
}

func (a *actionUsecase) UpdateSection(ctx context.Context, section domain.Section) error {
	return a.ActionRepository.UpdateSection(ctx, section)
}

func (a *actionUsecase) CreateExplanation(ctx context.Context, quizID string, answers domain.AnswerList) (string, error) {
	return a.ActionRepository.CreateExplanation(ctx, quizID, answers)
}

func (a *actionUsecase) QuizAnswer(ctx context.Context, quiz_id string, answers []domain.Answer) (int, bool, error) {
	return a.ActionRepository.QuizAnswer(ctx, quiz_id, answers)

}

func (a *actionUsecase) UploadSection(ctx context.Context, section domain.Section) (string, error) {
	return a.ActionRepository.UploadSection(ctx, section)

}

func (a *actionUsecase) UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error) {
	conversationId, err := a.ActionRepository.UploadConversation(ctx, conversation)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: UploadConversation " + err.Error())
	}
	return conversationId, nil
}

func (a *actionUsecase) UploadQuestions(ctx context.Context, questions []domain.Question, userID string) (string, error) {
	questionId, err := a.ActionRepository.UploadQuestions(ctx, questions, userID)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: UploadQuestions " + err.Error())
	}
	return questionId, nil
}

func (a *actionUsecase) UploadForGemini(processedText string) ([]domain.Question, []domain.ConversationTurn, error) {

	conversation, err := a.ActionRepository.UploadForGemini(processedText)

	if err != nil {
		return []domain.Question{}, []domain.ConversationTurn{}, errors.New("usecases/action_usecase.go: UploadForGemini " + err.Error())
	}

	question := conversation[0].Gemini

	formatted_question := a.ActionRepository.FormatQeustion(question)

	return formatted_question, conversation, nil
}

func (a *actionUsecase) GetPdfLink(ctx context.Context, file multipart.File, filename string) (string, error) {
	return a.ActionRepository.GetPdfLink(ctx, file, filename)
}
