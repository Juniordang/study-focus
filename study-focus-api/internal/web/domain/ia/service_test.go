package ia

import (
	"context"
	"errors"
	"testing"

	chaveapi "github.com/Juniordang/study-focus-api/internal/web/domain/chave-api"
)

type fakeProvider struct {
	response string
	err      error
}

func (p fakeProvider) GenerateResponse(context.Context, string) (string, error) {
	return p.response, p.err
}

func TestMaskAPIKey(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want string
	}{
		{name: "short key", key: "abc123", want: "********"},
		{name: "eight chars", key: "12345678", want: "********"},
		{name: "long key", key: "AIzaSyExampleabcd", want: "AIza...abcd"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := chaveapi.MaskAPIKey(tt.key); got != tt.want {
				t.Fatalf("MaskAPIKey() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestAIServiceAskReturnsFirstSuccessfulResponse(t *testing.T) {
	service := AIService{
		Providers: []AIProvider{
			fakeProvider{err: errors.New("first provider failed")},
			fakeProvider{response: "ok"},
		},
	}

	got, err := service.Ask(context.Background(), "prompt")
	if err != nil {
		t.Fatalf("Ask() returned unexpected error: %v", err)
	}

	if got != "ok" {
		t.Fatalf("Ask() = %q, want %q", got, "ok")
	}
}

func TestAIServiceAskReturnsNoProvidersError(t *testing.T) {
	service := AIService{}

	_, err := service.Ask(context.Background(), "prompt")
	if err == nil || err.Error() != "nenhum provedor de IA configurado" {
		t.Fatalf("Ask() error = %v, want no providers error", err)
	}
}

func TestAIServiceAskReturnsLastProviderError(t *testing.T) {
	lastErr := errors.New("second provider failed")
	service := AIService{
		Providers: []AIProvider{
			fakeProvider{err: errors.New("first provider failed")},
			fakeProvider{err: lastErr},
		},
	}

	_, err := service.Ask(context.Background(), "prompt")
	if !errors.Is(err, lastErr) {
		t.Fatalf("Ask() error = %v, want %v", err, lastErr)
	}
}
