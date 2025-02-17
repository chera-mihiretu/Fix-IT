package infrastructure

import (
	"errors"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type Claims struct {
	Email    string `json:"username"`
	Username string `json:"email"`
	jwt.StandardClaims
}

func GenerateJWT(username string, email string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Email:    email,
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	value, exists := os.LookupEnv("JWT_SECRET_KEY")
	if !exists {
		return "", errors.New("infrastructure/jwt_service: could not found jwt_secret_key, it does not exist")
	}
	jwtKey := []byte(value)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", errors.New("infrastructure/jwt_service: " + err.Error())
	}
	return tokenString, nil
}

func GenerateToken(email string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp":   expirationTime.Unix(),
	})

	value, exists := os.LookupEnv("JWT_SECRET_KEY")
	if !exists {
		return "", errors.New("infrastructure/jwt_service: could not found jwt_secret_key, it does not exist")
	}
	jwtKey := []byte(value)
	tokenString, err := token.SignedString(jwtKey)

	if err != nil {
		return "", errors.New("infrastructure/jwt_service: " + err.Error())
	}

	return tokenString, nil
}
