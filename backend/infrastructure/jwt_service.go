package infrastructure

import (
	"time"

	"github.com/dgrijalva/jwt-go"
)

var jwtKey = []byte("task_manager_jwt_secret_key")

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
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
