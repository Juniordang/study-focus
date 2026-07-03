package ia

import "context"

type AIProvider interface {
	GenerateResponse(ctx context.Context, prompt string) (string, error)
}
