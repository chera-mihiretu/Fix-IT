package infrastructure

import (
	"errors"
	"fix-it/domain"
	"regexp"
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

func SignInValidateUser(user *domain.User) error {
	if user.Email == "" {
		return errors.New("infrastructure/uservalidation: email is required")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	usernameRegex := regexp.MustCompile(`^[a-z0-9_]+$`)

	if emailRegex.MatchString(user.Email) {

	} else if usernameRegex.MatchString(user.Email) {

		user.Username = user.Email
		user.Email = ""
	} else {
		return errors.New("infrastructure/uservalidation: invalid email or username")
	}

	// Check password length
	if len(user.Password) < 6 {
		return errors.New("infrastructure/uservalidation: password must be at least 6 characters")
	}

	return nil

}
