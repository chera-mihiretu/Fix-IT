package router

import (
	"fix-it/delivery/controller"

	"github.com/gin-gonic/gin"
)

func SetUpRouter(usercontroller *controller.UserController) *gin.Engine {

	router := gin.New()

	router.POST("/register", usercontroller.Register)
	router.POST("/login", usercontroller.Login)
	router.GET("/verify", usercontroller.Verify)

	return router

}
