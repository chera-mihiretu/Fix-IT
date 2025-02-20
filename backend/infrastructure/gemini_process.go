package infrastructure

import (
	"context"
	"fmt"
	"github/chera/fix-it/domain"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func ExtractGeminiResponse(resp *genai.GenerateContentResponse) string {
	geminiResponse := ""
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		for _, part := range resp.Candidates[0].Content.Parts {
			if text, ok := part.(genai.Text); ok {
				geminiResponse += string(text)
			}
		}
	}
	return geminiResponse
}

func BuildPromptWithContext(userPrompt string, conversationHistory []domain.ConversationTurn) string {
	prompt := "Previous conversation:\n"
	for _, turn := range conversationHistory {
		prompt += fmt.Sprintf("User: %s\nGemini: %s\n", turn.User, turn.Gemini)
	}
	prompt += fmt.Sprintf("\nCurrent request:\n%s", userPrompt)
	return prompt
}

func NewGeminiModel() (*genai.GenerativeModel, context.Context, error) {
	ctx := context.Background()
	gemApi, exist := os.LookupEnv("GEM_API")

	if !exist {
		panic("GEMINI_API not found")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(gemApi))

	if err != nil {
		panic(fmt.Sprintf("could not create gemini client: %v", err))
	}

	model := client.GenerativeModel("gemini-pro")

	return model, ctx, nil

}
