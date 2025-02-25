package usecases

import (
	"context"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/repository"
)

type ViewUsecase interface {
	GetTopic(ctx context.Context, conversationID string) (domain.TopicList, error)
	GetQuiz(ctx context.Context, quizID string) (domain.Quiz, error)
	GetExplanation(ctx context.Context, explanationID string) (domain.Conversation, error)
	GetSection(ctx context.Context, sectionID string, userID string) (domain.Section, error)

	SectionList(ctx context.Context, userID string) ([]domain.Section, error)
}

type viewusecase struct {
	ViewRepository repository.ViewRepository
}

func NewViewUsecase(viewrepository repository.ViewRepository) ViewUsecase {
	return &viewusecase{
		ViewRepository: viewrepository,
	}
}

func (v *viewusecase) SectionList(ctx context.Context, userID string) ([]domain.Section, error) {
	return v.ViewRepository.SectionList(ctx, userID)
}

func (v *viewusecase) GetTopic(ctx context.Context, conversationID string) (domain.TopicList, error) {
	return v.ViewRepository.GetTopic(ctx, conversationID)
}

func (v *viewusecase) GetQuiz(ctx context.Context, quizID string) (domain.Quiz, error) {
	return v.ViewRepository.GetQuiz(ctx, quizID)
}

func (v *viewusecase) GetExplanation(ctx context.Context, explanationID string) (domain.Conversation, error) {
	return v.ViewRepository.GetExplanation(ctx, explanationID)
}

func (v *viewusecase) GetSection(ctx context.Context, sectionID string, userID string) (domain.Section, error) {
	return v.ViewRepository.GetSection(ctx, sectionID, userID)
}
