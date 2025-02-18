package usecases

import (
	"context"
	"errors"
	"fix-it/domain"
	"fix-it/repository"
)

type ActionUsecase interface {
	UploadPDF(ctx context.Context, pdf domain.PDF, username string) error
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
