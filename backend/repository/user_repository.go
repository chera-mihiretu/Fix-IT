package repository

import (
	"context"
	"errors"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user domain.User) error
	VerifyUser(ctx context.Context, email, token string) error
	IsUserExist(ctx context.Context, username string) (bool, error)
	GetUserByEmail(ctx context.Context, email string) (domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (domain.User, error)
}

type userRepository struct {
	users        *mongo.Collection
	verification *mongo.Collection
}

func NewUserRepository(db *mongo.Database) UserRepository {
	return &userRepository{
		users:        db.Collection("users"),
		verification: db.Collection("verification"),
	}
}

func (r *userRepository) VerifyUser(ctx context.Context, email, token string) error {

	filter := bson.M{"email": email, "token": token}

	var user domain.User

	err := r.verification.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	_, err = r.users.InsertOne(ctx, user)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	filter = bson.M{"email": email}

	_, err = r.verification.DeleteMany(ctx, filter)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	return nil

}

func (r *userRepository) CreateUser(ctx context.Context, user domain.User) error {

	exists, err := r.IsUserExist(ctx, user.Username)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	if exists {
		return errors.New("user already exist")
	}

	token, err := infrastructure.GenerateToken(user.Email)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	new_user := bson.M{
		"username":  user.Username,
		"email":     user.Email,
		"age":       user.Age,
		"academic":  user.Academic,
		"password":  user.Password,
		"token":     token,
		"createdAt": time.Now(),
	}

	err = infrastructure.SendEmail(user.Email, token)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}

	_, err = r.verification.InsertOne(ctx, new_user)

	if err != nil {
		return errors.New("repository/user_repository: " + err.Error())
	}
	return nil

}

func (r *userRepository) IsUserExist(ctx context.Context, username string) (bool, error) {
	filter := bson.M{"username": username}

	count, err := r.users.CountDocuments(ctx, filter)

	if err != nil {
		return false, errors.New("repository/user_repository: " + err.Error())
	}
	return count > 0, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (domain.User, error) {
	var user domain.User
	filter := bson.M{"email": email}

	err := r.users.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.User{}, errors.New("no such user")
		}
		return domain.User{}, errors.New("repository/user_repository: " + err.Error())
	}
	return user, nil
}

func (r *userRepository) GetUserByUsername(ctx context.Context, username string) (domain.User, error) {
	var user domain.User
	filter := bson.M{"username": username}

	err := r.users.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.User{}, errors.New("no such user")
		}
		return domain.User{}, errors.New("repository/user_repository: " + err.Error())
	}
	return user, nil
}
