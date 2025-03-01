package main

import (
	"context"
	"fmt"
	"github/chera/fix-it/delivery/controller"
	"github/chera/fix-it/delivery/router"
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/repository"
	"github/chera/fix-it/usecases"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
)

// setting log flags

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.SetOutput(os.Stdout) // Optional: Output to terminal

}

func main() {

	// Inviroment loading
	// if os.Getenv("RENDER_EXTERNAL_HOSTNAME") == "" {
	// 	err := godotenv.Load()
	// 	if err != nil {
	// 		log.Println("No .env file found, using Render environment variables")
	// 	}
	// 	if err != nil {
	// 		log.Fatal("could not load env file")
	// 	}
	// }

	// mongoDB connection and client creation
	client, err := infrastructure.NewMongoClient()

	if err != nil {
		log.Fatalf("could not connect to mongo: %v", err)
	}

	defer func(client *mongo.Client) {
		err := client.Disconnect(context.Background())
		if err != nil {
			log.Fatalf("could not disconnect from mongo: %v", err)
		}
	}(client)

	// Gemini model loading
	gem_model, gem_context, err := infrastructure.NewGeminiModel()

	if err != nil {
		log.Fatalf("could not load gemini model: %v", err)
	}

	fmt.Println("✅ Gemini model loaded successfully")

	my_database := client.Database("fix-it")

	if err != nil {
		log.Fatalf("could not create appwrite client: %v", err)
	}

	fmt.Println("🚀 Fix-it server starting... Version 1.0.7")
	userRepo := repository.NewUserRepository(my_database)
	viewRepo := repository.NewViewController(my_database)
	actionRepo := repository.NewActionRepository(my_database, gem_model, gem_context)
	viewusecase := usecases.NewViewUsecase(viewRepo)
	userusecase := usecases.NewUseCase(userRepo)
	actionusecase := usecases.NewActionUsecase(actionRepo)

	viewcontroller := controller.NewViewController(viewusecase, actionusecase)
	usercontroller := controller.NewUserController(userusecase)
	actioncontroller := controller.NewActionController(actionusecase, viewusecase)

	router := router.SetUpRouter(usercontroller, actioncontroller, viewcontroller)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("could not run server: %v", err)
	}

}
