package ia

import (
	"context"
	"errors"
	"strings"
)

type AIService struct {
	Providers []AIProvider
}

func (s *AIService) Ask(ctx context.Context, prompt string) (string, error) {
	if len(s.Providers) == 0 {
		return "", errors.New("nenhum provedor de IA configurado")
	}

	var lastErr error

	for _, provider := range s.Providers {
		response, err := provider.GenerateResponse(ctx, prompt)
		if err == nil {
			return response, nil
		}
		lastErr = err
	}

	if lastErr != nil {
		return "", lastErr
	}

	return "", errors.New("nenhum provedor de IA respondeu")
}

func escondeChaveApiEmError(err error, apiKey string) error {
	if err == nil || apiKey == "" {
		return err
	}

	return errors.New(strings.ReplaceAll(err.Error(), apiKey, "[API_KEY_REDACTED]"))
}

func escondeChaveApiEmMensagens(message string, apiKey string) string {
	if apiKey == "" {
		return message
	}

	return strings.ReplaceAll(message, apiKey, "[API_KEY_REDACTED]")
}
