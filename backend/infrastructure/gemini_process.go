package infrastructure

import (
	"context"
	"fmt"
	"github/chera/fix-it/domain"
	"os"
	"strings"

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
	gemModel, exist := os.LookupEnv("GEMINI_MODEL")

	if !exist {
		panic("GEMINI_MODEL not found")
	}
	gemApi, exist := os.LookupEnv("GEM_API")

	if !exist {
		panic("GEMINI_API not found")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(gemApi))

	if err != nil {
		panic(fmt.Sprintf("could not create gemini client: %v", err))
	}

	model := client.GenerativeModel(gemModel)

	return model, ctx, nil

}

func ExtractTopicGemini(resp *genai.GenerateContentResponse) string {
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

func ParseTopicGemini(gemini string) domain.TopicList {
	lines := strings.Split(gemini, "\n")

	var topics []domain.Topic
	var currentTopic domain.Topic

	for _, line := range lines {
		if line == "" {
			continue
		}

		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Weak Point") {
			if currentTopic.Title != "" {
				topics = append(topics, currentTopic)
			}
			title := line[13:]
			currentTopic.Title = title
		} else if strings.HasPrefix(line, "Explanation") {
			explanation := line[13:]
			currentTopic.Explanation = explanation
		} else {
			currentTopic.Explanation += line
		}
	}

	if currentTopic.Title != "" {
		topics = append(topics, currentTopic)
	}

	var topicList domain.TopicList

	topicList.Topics = topics

	return topicList
}
