package repository

import (
	"context"
	"errors"
	"fix-it/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActionRepository interface {
	UploadPDF(ctx context.Context, pdf domain.PDF, username string) error
}

type actionRepository struct {
	UserBooks *mongo.Collection
}

func NewActionRepository(db *mongo.Database) ActionRepository {
	return &actionRepository{
		UserBooks: db.Collection("pdf"),
	}
}

func (r *actionRepository) UploadPDF(ctx context.Context, pdf domain.PDF, username string) error {

	upsert := true

	filter := bson.M{"username": username}
	update := bson.M{"$push": bson.M{"pdf": pdf}}

	_, err := r.UserBooks.UpdateOne(ctx, filter, update, &options.UpdateOptions{Upsert: &upsert})

	if err != nil {
		return errors.New("repository/action_repository: " + err.Error())
	}

	return nil

}
