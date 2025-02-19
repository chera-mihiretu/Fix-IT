package router

import (
	"github/chera/fix-it/delivery/controller"
	"github/chera/fix-it/infrastructure"

	"github.com/gin-gonic/gin"
)

func SetUpRouter(usercontroller *controller.UserController, actioncontroller *controller.ActionController) *gin.Engine {

	router := gin.New()
	user := router.Group("/u")
	user.POST("/register", usercontroller.Register)
	user.POST("/login", usercontroller.Login)
	user.GET("/verify", usercontroller.Verify)

	// add an endpoint to upload a pdf and should have token of the user
	action := router.Group("/action")
	action.POST("/upload", infrastructure.AuthMiddleWare(), actioncontroller.UploadPDF)

	return router

}
