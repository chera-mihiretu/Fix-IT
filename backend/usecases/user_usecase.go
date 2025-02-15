package usescases

import (
	"context"
	"errors"
	"fix-it/domain"
	repository "fix-it/repositories"
)

type UserUsecase interface {
	Register(ctx context.Context, user domain.User) error
	Login(ctx context.Context, user domain.User) (string, error)
}

type userUsecase struct {
	UserRepository repository.UserRepository
}

func NewUseCase(repo repository.UserRepository) UserUsecase {
	return &userUsecase{
		UserRepository: repo,
	}
}

func (u *userUsecase) Register(ctx context.Context, user domain.User) error {
	// Add user registration logic here
	err := u.UserRepository.CreateUser(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (u *userUsecase) Login(ctx context.Context, user domain.User) (string, error) {
	// Add user login logic here
	storedUser, err := u.UserRepository.GetUserByEmail(ctx, user.Email)
	if err != nil {
		return "", err
	}

	if storedUser.Password != user.Password {
		return "", errors.New("No Such User")
	}

	// Generate token (this is just a placeholder, implement your own token generation logic)
	token := "generated-jwt-token"
	return token, nil
}
