package main

import (
	"context"
	"fix-it/delivery/controller"
	"fix-it/delivery/router"
	"fix-it/infrastructure"
	"fix-it/repository"
	"fix-it/usecases"
	"log"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("could not load env file")
	}

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

	my_database := client.Database("fix-it")

	userRepo := repository.NewUserRepository(my_database)
	actionRepo := repository.NewActionRepository(my_database)
	userusecase := usecases.NewUseCase(userRepo)
	actionusecase := usecases.NewActionUsecase(actionRepo)

	usercontroller := controller.NewUserController(userusecase)
	actioncontroller := controller.NewActionController(actionusecase)

	router := router.SetUpRouter(usercontroller, actioncontroller)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("could not run server: %v", err)
	}

}
