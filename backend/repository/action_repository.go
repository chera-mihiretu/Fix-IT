package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActionRepository interface {
	UploadPDF(ctx context.Context, pdf domain.PDF, username string) error
	ProcessPDF(ctx context.Context, link string) (string, error)
	UploadForGemini(ctx context.Context, processedText string) error
	GetDropLink(ctx context.Context, filename string) (string, error)
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

func (r *actionRepository) ProcessPDF(ctx context.Context, link string) (string, error) {

	processedTextLink, err := infrastructure.ProcessPDF(link)

	if err != nil {
		return "", errors.New("repository/action_repository: " + err.Error())
	}

	textResponse, err := http.Get(processedTextLink)
	if err != nil {
		return "", fmt.Errorf("error downloading text: %w", err)
	}
	defer textResponse.Body.Close()

	if textResponse.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(textResponse.Body)
		return "", fmt.Errorf("error downloading text, status: %d, body: %s", textResponse.StatusCode, string(body))
	}

	textBytes, err := io.ReadAll(textResponse.Body)
	if err != nil {
		return "", fmt.Errorf("error reading downloaded text: %w", err)
	}

	extractedText := string(textBytes)
	return extractedText, nil

}

func (r *actionRepository) UploadForGemini(ctx context.Context, processedText string) error {
	geminiToken, exist := os.LookupEnv("GEM_API")
	if !exist {
		return errors.New("usecases/action_usecase.go: UploadForGemini " + "No Gemini token found")
	}

	service, err := generative

	return nil
}

func (r *actionRepository) GetDropLink(ctx context.Context, filename string) (string, error) {
	url := "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings"
	reqBody := fmt.Sprintf(`{"path":"/%s","settings":{"requested_visibility":"public"}}`, filename)

	req, err := http.NewRequest("POST", url, bytes.NewReader([]byte(reqBody)))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	apiKey, exist := os.LookupEnv("DROPBOX_TOKEN")
	if !exist {
		return "", fmt.Errorf("error loading dropbox api key: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	// Read and handle the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response body: %v", err)
	}

	// If the request was successful, parse the shared link from the response
	var response map[string]interface{}
	err = json.Unmarshal(body, &response)
	if err != nil {
		return "", fmt.Errorf("error unmarshalling response: %v", err)
	}

	// Extract the URL from the response
	if link, exists := response["url"].(string); exists {
		link = strings.Replace(link, "https://www", "https://dl", -1)
		return link, nil
	}

	return "", fmt.Errorf("could not find URL in response")
}
