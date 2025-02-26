package usecases

import (
	"context"
	"errors"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	repository "github/chera/fix-it/repository"
)

type UserUsecase interface {
	Register(ctx context.Context, user domain.User) error
	Login(ctx context.Context, user domain.User) (string, error)
	Verify(ctx context.Context, token string) error
	GenerateToken(user_id string) (string, error)
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
	return u.UserRepository.CreateUser(ctx, user)

}

func (u *userUsecase) Login(ctx context.Context, user domain.User) (string, error) {

	err := infrastructure.SignInValidateUser(&user)
	if err != nil {
		return "", errors.New("usecases/user_usecase.go: Login " + err.Error())
	}

	var storedUser domain.User
	var u_error error

	if user.Email == "" {
		storedUser, u_error = u.UserRepository.GetUserByUsername(ctx, user.Username)
	} else {
		storedUser, u_error = u.UserRepository.GetUserByEmail(ctx, user.Email)
	}

	if u_error != nil {
		return "", errors.New(u_error.Error())
	}

	equal := infrastructure.ComparePassword(storedUser.Password, user.Password)

	if !equal {
		return "", errors.New("no such user")
	}

	return storedUser.ID.Hex(), nil
}

func (u *userUsecase) GenerateToken(user_id string) (string, error) {
	// Generate token
	token, err := infrastructure.GenerateJWT(user_id)
	if err != nil {
		return "", errors.New("usecases/user_usecase.go: Login " + err.Error())
	}
	return token, nil
}
