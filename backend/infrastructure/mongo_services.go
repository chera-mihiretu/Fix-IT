package infrastructure

import (
	"context"
	"fmt"
	"os"
	"time"

	"errors"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// NewMongoClient initializes and returns a MongoDB client
func NewMongoClient() (*mongo.Client, error) {

	err := godotenv.Load()
	if err != nil {
		return nil, errors.New("infrastructure/mongo_services.go: " + err.Error())
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		return nil, errors.New("infrastructure/mongo_services.go: MONGO_URI not found in environment")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, errors.New("infrastructure/mongo_services.go: failed to create MongoDB client: " + err.Error())
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Ping to check connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, errors.New("infrastructure/mongo_services.go: failed to ping MongoDB: " + err.Error())
	}

	fmt.Println("✅ MongoDB connected successfully!")

	return client, nil
}
