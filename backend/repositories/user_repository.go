package repository

import (
	"context"
	"fix-it/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) error
	IsUserExist(ctx context.Context, username string) (bool, error)
	GetUserByEmail(ctx context.Context, email string) (domain.User, error)
}

type userRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database) UserRepository {
	return &userRepository{
		collection: db.Collection("users"),
	}
}

func (r *userRepository) CreateUser(ctx context.Context, user domain.User) error {

	_, err := r.IsUserExist(ctx, user.Username)

	if err != nil {
		return err
	}
	_, err = r.collection.InsertOne(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) IsUserExist(ctx context.Context, username string) (bool, error) {
	filter := bson.M{"username": username}
	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (domain.User, error) {
	var user domain.User
	filter := bson.M{"email": email}
	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.User{}, nil
		}
		return domain.User{}, err
	}
	return user, nil
}
