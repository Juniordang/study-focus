package ia

import (
	"context"
	"errors"
	"strings"

	"github.com/Juniordang/study-focus-api/cmd/config"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiProvider struct {
	ApiKey string
}

func (p *GeminiProvider) GenerateResponse(ctx context.Context, prompt string) (string, error) {
	logger := config.Newlogger("ai")

	client, err := genai.NewClient(ctx, option.WithAPIKey(p.ApiKey))
	if err != nil {
		safeErr := escondeChaveApiEmError(err, p.ApiKey)
		logger.Errf("error on create new client ai: %v", safeErr.Error())
		return "", safeErr
	}

	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.4)
	model.SetMaxOutputTokens(2000)

	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text(SystemInstruction)},
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		safeErr := escondeChaveApiEmError(err, p.ApiKey)
		logger.Errf("erro on generate response: %v", safeErr.Error())
		return "", safeErr
	}

	if len(resp.Candidates) > 0 {
		var builder strings.Builder
		for _, part := range resp.Candidates[0].Content.Parts {
			if texto, ok := part.(genai.Text); ok {
				builder.WriteString(string(texto))
			}
		}
		return builder.String(), nil
	}

	return "", errors.New("not response")
}
