package controller

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	usescases "github/chera/fix-it/usecases"
	"log"
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
		// If the user input wrong intput
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input " + err.Error()})
		return
	}

	hashedPassword, err := infrastructure.HashPassword(user.Password)

	if err != nil {
		// logging and also displaying for the user
		log.Println("Error hashing password: ", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong Please Try again "})
		return
	}

	user.Password = hashedPassword

	err = u.userUsecase.Register(ctx, user)

	if err != nil {
		log.Println("Error creating user: ", err)
		ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "User Created Successfully, Please Verify Your account"})

}

func (u *UserController) Login(ctx *gin.Context) {
	var user domain.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input" + err.Error()})
		return
	}

	userid, err := u.userUsecase.Login(ctx, user)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User Don't Exist"})
		return
	}

	token, err := u.userUsecase.GenerateToken(userid)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went wrong Please try again"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"token":   token,
		"message": "Logged In successfully",
	})
}
