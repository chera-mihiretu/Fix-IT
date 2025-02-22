package repository

import (
	"context"
	"fmt"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ViewRepository interface {
	GetTopic(ctx context.Context, conversationID string) (domain.TopicList, error)
	GetQuiz(ctx context.Context, quizID string) (domain.Quiz, error)
	GetExplanation(ctx context.Context, explanationID string) (domain.Conversation, error)
	GetSection(ctx context.Context, sectionID, userID string) (domain.Section, error)
}

type viewRepository struct {
	UserBooks        *mongo.Collection
	UserQuiz         *mongo.Collection
	UserSections     *mongo.Collection
	UserConversation *mongo.Collection
}

func NewViewController(db *mongo.Database) ViewRepository {
	return &viewRepository{
		UserBooks:        db.Collection("pdf"),
		UserQuiz:         db.Collection("quiz"),
		UserConversation: db.Collection("conversation"),
		UserSections:     db.Collection("section"),
	}
}

func (r *viewRepository) GetTopic(ctx context.Context, conversationID string) (domain.TopicList, error) {
	var conversation domain.Conversation

	objectID, err := primitive.ObjectIDFromHex(conversationID)

	if err != nil {
		return domain.TopicList{}, err
	}

	filter := bson.M{"_id": objectID}

	err = r.UserConversation.FindOne(ctx, filter).Decode(&conversation)

	if err != nil {
		return domain.TopicList{}, err
	}

	if len(conversation.Turns) < 2 {
		return domain.TopicList{}, fmt.Errorf("No topic found")

	}

	topicConvert := infrastructure.ParseTopicGemini(conversation.Turns[2].Gemini)

	return topicConvert, nil
}

func (r *viewRepository) GetSection(ctx context.Context, sectionID, userID string) (domain.Section, error) {
	var section domain.Section

	objectID, err := primitive.ObjectIDFromHex(sectionID)

	if err != nil {
		return domain.Section{}, err
	}

	fmt.Println("Section ID", objectID, "User ID", userID)

	filter := bson.M{
		"_id":        objectID,
		"created_by": userID,
	}

	err = r.UserSections.FindOne(ctx, filter).Decode(&section)

	if err != nil {
		return domain.Section{}, err
	}

	return section, nil
}

func (r *viewRepository) GetQuiz(ctx context.Context, quizID string) (domain.Quiz, error) {
	var quiz domain.Quiz

	objectID, err := primitive.ObjectIDFromHex(quizID)

	if err != nil {
		return domain.Quiz{}, err
	}

	filter := bson.M{"_id": objectID}

	err = r.UserQuiz.FindOne(ctx, filter).Decode(&quiz)

	if err != nil {
		return domain.Quiz{}, err
	}

	return quiz, nil
}

func (r *viewRepository) GetExplanation(ctx context.Context, explanationID string) (domain.Conversation, error) {
	var conversation domain.Conversation

	objectID, err := primitive.ObjectIDFromHex(explanationID)

	if err != nil {
		return domain.Conversation{}, err
	}

	filter := bson.M{"_id": objectID}

	err = r.UserConversation.FindOne(ctx, filter).Decode(&conversation)

	if err != nil {
		return domain.Conversation{}, err
	}

	return conversation, nil
}
