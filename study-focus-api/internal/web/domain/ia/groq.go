package ia

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/Juniordang/study-focus-api/cmd/config"
)

const groqChatCompletionsURL = "https://api.groq.com/openai/v1/chat/completions"

type GroqProvider struct {
	ApiKey string
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type groqRequest struct {
	Model       string        `json:"model"`
	Messages    []groqMessage `json:"messages"`
	Temperature float32       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type groqResponse struct {
	Choices []struct {
		Message groqMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func (p *GroqProvider) GenerateResponse(ctx context.Context, prompt string) (string, error) {
	logger := config.Newlogger("groq")

	payload := groqRequest{
		Model:       "llama-3.1-8b-instant",
		Temperature: 0.4,
		MaxTokens:   2000,
		Messages: []groqMessage{
			{
				Role:    "system",
				Content: SystemInstruction,
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, groqChatCompletionsURL, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+p.ApiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		safeErr := escondeChaveApiEmError(err, p.ApiKey)
		logger.Errf("error on groq request: %v", safeErr.Error())
		return "", safeErr
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var decoded groqResponse
	if err := json.Unmarshal(respBody, &decoded); err != nil {
		return "", err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if decoded.Error != nil && decoded.Error.Message != "" {
			return "", errors.New(escondeChaveApiEmMensagens(decoded.Error.Message, p.ApiKey))
		}
		return "", fmt.Errorf("groq retornou status %d", resp.StatusCode)
	}

	if len(decoded.Choices) == 0 || decoded.Choices[0].Message.Content == "" {
		return "", errors.New("groq não retornou resposta")
	}

	return decoded.Choices[0].Message.Content, nil
}
