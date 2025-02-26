package router

import (
	"github/chera/fix-it/delivery/controller"
	"github/chera/fix-it/infrastructure"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetUpRouter(usercontroller *controller.UserController, actioncontroller *controller.ActionController, viewcontroller *controller.ViewController) *gin.Engine {

	router := gin.New()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Origin", "X-Requested-With"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * 60 * 60,
	}))

	user := router.Group("/u")
	user.POST("/register", usercontroller.Register)
	user.POST("/login", usercontroller.Login)
	user.GET("/verify", usercontroller.Verify)

	// add an endpoint to upload a pdf and should have token of the user
	action := router.Group("/a")
	action.POST("/upload", infrastructure.AuthMiddleWare(), actioncontroller.UploadPDF)
	action.POST("/quiz_answer", infrastructure.AuthMiddleWare(), actioncontroller.QuizAnswer)
	action.GET("/more", infrastructure.AuthMiddleWare(), viewcontroller.CreateTopic) // should be section id

	// end points to retreive the results
	result := router.Group("/r")

	result.GET("/explanation", infrastructure.AuthMiddleWare(), viewcontroller.ViewExplanation) // should be section id
	result.GET("/quiz", infrastructure.AuthMiddleWare(), viewcontroller.ViewQuiz)
	result.GET("/topic", infrastructure.AuthMiddleWare(), viewcontroller.ViewTopics)
	result.GET("/sections", infrastructure.AuthMiddleWare(), viewcontroller.SectionList)
	result.GET("/section_detail", infrastructure.AuthMiddleWare(), viewcontroller.SectionDetail)

	return router

}
