package ia

import (
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	chaveapi "github.com/Juniordang/study-focus-api/internal/web/domain/chave-api"
)

type Card struct {
	Pergunta string `json:"question"`
	Resposta string `json:"answer"`
}

type ChaveIAResponse struct {
	ID             uint      `json:"id"`
	Provedor       string    `json:"provedor"`
	UsuarioID      uint      `json:"usuario_id"`
	ChaveMascarada string    `json:"chave_mascarada"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func ToChaveIAResponse(config schema.ChaveIA) ChaveIAResponse {
	return ChaveIAResponse{
		ID:             config.ID,
		Provedor:       config.Provedor,
		UsuarioID:      config.UsuarioID,
		ChaveMascarada: chaveapi.MaskAPIKey(config.ChaveApi),
		CreatedAt:      config.CreatedAt,
		UpdatedAt:      config.UpdatedAt,
	}
}

func ToChaveIAResponses(configs []schema.ChaveIA) []ChaveIAResponse {
	responses := make([]ChaveIAResponse, 0, len(configs))
	for _, config := range configs {
		responses = append(responses, ToChaveIAResponse(config))
	}

	return responses
}
