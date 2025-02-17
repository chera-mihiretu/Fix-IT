package infrastructure

import (
	"errors"
	"fix-it/domain"
)

func SignUpValidateUser(user domain.User) error {
	if user.Username == "" {
		return errors.New("infrastructure/uservalidation: username is required")
	}

	if user.Email == "" {
		return errors.New("infrastructure/uservalidation: email is required")
	}

	if user.Password == "" {
		return errors.New("infrastructure/uservalidation: password is required")
	}

	if user.Age == 0 {
		return errors.New("infrastructure/uservalidation: age is required")
	}

	if user.Academic == "" {
		return errors.New("infrastructure/uservalidation: academic is required")
	}

	if user.Academic != "Undergraduated" && user.Academic != "High School" {
		return errors.New("infrastructure/uservalidation: academic must be Undergraduated or High School")
	}

	if len(user.Password) < 6 {
		return errors.New("infrastructure/uservalidation: password must be at least 6 characters")
	}

	return nil
}
