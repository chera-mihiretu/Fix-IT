package controller

import (
	"fix-it/domain"
	"fix-it/infrastructure"
	usescases "fix-it/usecases"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userUsecase usescases.UserUsecase
}

func NewUserController(userusecase usescases.UserUsecase) *UserController {
	return &UserController{
		userUsecase: userusecase,
	}
}

func (u *UserController) Verify(ctx *gin.Context) {
	token := ctx.DefaultQuery("token", "")

	err := u.userUsecase.Verify(ctx, token)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "user verified"})
}

func (u *UserController) Register(ctx *gin.Context) {
	var user domain.User

	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := infrastructure.SignUpValidateUser(user)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := infrastructure.HashPassword(user.Password)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Password = hashedPassword

	err = u.userUsecase.Register(ctx, user)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "user created"})

}

func (u *UserController) Login(ctx *gin.Context) {
	var user domain.User

	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(user)

	token, err := u.userUsecase.Login(ctx, user)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"token": token})
}
