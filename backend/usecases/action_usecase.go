package usecases

import (
	"context"
	"errors"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/repository"
	"io"
	"mime/multipart"
	"net/http"
)

type ActionUsecase interface {
	UploadPDF(ctx context.Context, pdf domain.PDF) (string, error)
	UploadQuestions(ctx context.Context, questions []domain.Question) (string, error)
	UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error)
	UploadSection(ctx context.Context, section domain.Section) error

	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadForGemini(processed_text string) ([]domain.Question, []domain.ConversationTurn, error)
	GetDropLink(ctx context.Context, filename string) (string, error)
	UploadToDropBox(ctx context.Context, file multipart.File, filename, token string) error
}

type actionUsecase struct {
	ActionRepository repository.ActionRepository
}

func NewActionUsecase(repo repository.ActionRepository) ActionUsecase {
	return &actionUsecase{
		ActionRepository: repo,
	}
}

func (a *actionUsecase) UploadSection(ctx context.Context, section domain.Section) error {
	err := a.ActionRepository.UploadSection(ctx, section)
	if err != nil {
		return errors.New("usecases/action_usecase.go: UploadSection " + err.Error())
	}
	return nil
}

func (a *actionUsecase) UploadConversation(ctx context.Context, conversation []domain.ConversationTurn) (string, error) {
	conversationId, err := a.ActionRepository.UploadConversation(ctx, conversation)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: UploadConversation " + err.Error())
	}
	return conversationId, nil
}

func (a *actionUsecase) UploadQuestions(ctx context.Context, questions []domain.Question) (string, error) {
	questionId, err := a.ActionRepository.UploadQuestions(ctx, questions)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: UploadQuestions " + err.Error())
	}
	return questionId, nil
}

func (a *actionUsecase) UploadPDF(ctx context.Context, pdf domain.PDF) (string, error) {
	pdfId, err := a.ActionRepository.UploadPDF(ctx, pdf)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: UploadPDF " + err.Error())
	}
	return pdfId, nil
}

func (a *actionUsecase) ProcessPDF(ctx context.Context, link string) (string, error) {

	processedText, err := a.ActionRepository.ProcessPDF(ctx, link)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: ProcessPDF " + err.Error())
	}

	return processedText, nil
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

func (a *actionUsecase) GetDropLink(ctx context.Context, filename string) (string, error) {
	return a.ActionRepository.GetDropLink(ctx, filename)
}

func (a *actionUsecase) UploadToDropBox(ctx context.Context, file multipart.File, filename, drop_token string) error {
	drop_box_url := "https://content.dropboxapi.com/2/files/upload"

	req, err := http.NewRequest("POST", drop_box_url, file)

	if err != nil {
		return errors.New("usecases/action_usecase.go: UploadToDropBox " + err.Error())
	}

	req.Header.Set("Authorization", "Bearer "+drop_token)
	req.Header.Set("Content-Type", "application/octet-stream")
	req.Header.Set("Dropbox-API-Arg", "{\"path\": \"/"+filename+"\"}")

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {

		return errors.New("usecases/action_usecase.go: UploadToDropBox " + err.Error())
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return errors.New("usecases/action_usecase.go: UploadToDropBox " + err.Error())

	}

	if resp.StatusCode != http.StatusOK {

		return errors.New("usecases/action_usecase.go: UploadToDropBox " + string(body))

	}
	return nil
}
