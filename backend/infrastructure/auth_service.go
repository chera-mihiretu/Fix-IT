package infrastructure

import (
	"errors"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func AuthMiddleWare() gin.HandlerFunc {
	load_key, exist := os.LookupEnv("JWT_SECRET_KEY")

	jwtKey := []byte(load_key)

	if !exist {
		panic("No JWT_SECRET_KEY found")
	}

	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		if tokenString == "" {
			c.JSON(401, gin.H{"error": "No token found"})
			c.Abort()

		}

		if strings.HasPrefix(tokenString, "Bearer") {
			tokenString = tokenString[7:]
		}

		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("invalid token")
			}

			return jwtKey, nil
		})

		if err != nil {
			c.JSON(401, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*Claims)

		if !ok || !token.Valid {
			c.JSON(401, gin.H{"error": "Invalid Token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.ID)
		c.Next()

	}

}
