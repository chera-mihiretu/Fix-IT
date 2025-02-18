package usecases

import (
	"context"
	"errors"
	"fix-it/domain"
	"fix-it/infrastructure"
	repository "fix-it/repository"
)

type UserUsecase interface {
	Register(ctx context.Context, user domain.User) error
	Login(ctx context.Context, user domain.User) (string, error)
	Verify(ctx context.Context, token string) error
}

type userUsecase struct {
	UserRepository repository.UserRepository
}

func NewUseCase(repo repository.UserRepository) UserUsecase {
	return &userUsecase{
		UserRepository: repo,
	}
}

func (u *userUsecase) Verify(ctx context.Context, token string) error {

	email, err := infrastructure.VerificationTokenValidate(token)

	if err != nil {
		return errors.New("usecases/user_usecase.go: Verify " + err.Error())
	}

	err = u.UserRepository.VerifyUser(ctx, email, token)

	if err != nil {
		return errors.New("usecases/user_usecase.go: Verify " + err.Error())
	}

	return nil
}

func (u *userUsecase) Register(ctx context.Context, user domain.User) error {
	// Add user registration logic here
	err := u.UserRepository.CreateUser(ctx, user)
	if err != nil {
		return errors.New("usecases/user_usecase.go: Register " + err.Error())
	}
	return nil
}

func (u *userUsecase) Login(ctx context.Context, user domain.User) (string, error) {
	// Add user login logic here
	storedUser, err := u.UserRepository.GetUserByEmail(ctx, user.Email)
	if err != nil {
		return "", errors.New("usecases/user_usecase.go: Login " + err.Error())
	}

	if storedUser.Password != user.Password {
		return "", errors.New("usecases/user_usecase.go: Login - no such user")
	}

	// Generate token
	token, err := infrastructure.GenerateJWT(user.Username, user.Username)
	if err != nil {
		return "", errors.New("usecases/user_usecase.go: Login " + err.Error())
	}
	return token, nil
}
