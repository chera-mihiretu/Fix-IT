package usecases

import (
	"context"
	"errors"
	"fix-it/domain"
	"fix-it/repository"
	"io"
	"mime/multipart"
	"net/http"
)

type ActionUsecase interface {
	UploadPDF(ctx context.Context, pdf domain.PDF, username string) error
	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadForGemini(ctx context.Context, processed_text string) error
	GetDropLink(ctx context.Context, filename string) (string, error)
	UploadToDropBox(ctx context.Context, file multipart.File, filename, token string) error
}

type actionUsecase struct {
	PDFRepository repository.ActionRepository
}

func NewActionUsecase(repo repository.ActionRepository) ActionUsecase {
	return &actionUsecase{
		PDFRepository: repo,
	}
}

func (a *actionUsecase) UploadPDF(ctx context.Context, pdf domain.PDF, username string) error {
	err := a.PDFRepository.UploadPDF(ctx, pdf, username)
	if err != nil {
		return errors.New("usecases/action_usecase.go: UploadPDF " + err.Error())
	}
	return nil
}

func (a *actionUsecase) ProcessPDF(ctx context.Context, link string) (string, error) {

	processedText, err := a.PDFRepository.ProcessPDF(ctx, link)
	if err != nil {
		return "", errors.New("usecases/action_usecase.go: ProcessPDF " + err.Error())
	}

	return processedText, nil
}

func (a *actionUsecase) UploadForGemini(ctx context.Context, processedText string) error {

	return nil
}

func (a *actionUsecase) GetDropLink(ctx context.Context, filename string) (string, error) {
	return a.PDFRepository.GetDropLink(ctx, filename)
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
