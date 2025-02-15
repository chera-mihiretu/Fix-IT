package repository

import (
	"context"
	"fix-it/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) (domain.User, error)
	IsUserExist(ctx context.Context, username string) (bool, error)
}

type UserRepositoryImpl struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database) UserRepository {
	return &UserRepositoryImpl{
		collection: db.Collection("users"),
	}
}

func (r *UserRepositoryImpl) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {

	_, err := r.IsUserExist(ctx, user.Username)

	if err != nil {
		return domain.User{}, err
	}
	_, err = r.collection.InsertOne(ctx, user)
	if err != nil {
		return domain.User{}, err
	}
	return user, nil
}

func (r *UserRepositoryImpl) IsUserExist(ctx context.Context, username string) (bool, error) {
	filter := bson.M{"username": username}
	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
