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

func GenerateJWT(username, email string) (string, error) {
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

func VerificationTokenValidate(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		secretKey, exist := os.LookupEnv("JWT_SECRET_KEY")

		if !exist {
			return nil, errors.New("infrastructure/jwt_service: " + "could not found jwt_secret_key, it does not exist")
		}
		return []byte(secretKey), nil

	})

	if err != nil {
		return "", errors.New("infrastructure/jwt_service: " + err.Error())
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		expiration := claims["exp"].(float64)

		if time.Now().Unix() > int64(expiration) {
			return "", errors.New("infrastructure/jwt_service: " + "token is expired")
		}
		email := claims["email"].(string)
		return email, nil
	}

	return "", errors.New("infrastructure/jwt_service: " + "invalid token")

}
