package handlerflashcard

import (
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FlashcardRequest struct {
	Pergunta  string `json:"pergunta" binding:"required"`
	Resposta  string `json:"resposta" binding:"required"`
	Nivel     int    `json:"nivel" default:"1"`
	AssuntoID string `json:"assuntoId"`
}

func Create(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		var req FlashcardRequest
		req.Nivel = 3

		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		if req.AssuntoID == "" {
			handlers.SendError(c, http.StatusBadRequest, "o ID do assunto é obrigatório")
			return
		}

		id, err := strconv.ParseUint(req.AssuntoID, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do assunto inválido")
			return
		}
		assuntoID := uint(id)

		proximaRevisao, err := flashcard.CalcularProximaRevisao(req.Nivel)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		newCard := schema.Flashcard{
			Pergunta:           req.Pergunta,
			Resposta:           req.Resposta,
			NivelDificuldade:   req.Nivel,
			DataProximaRevisao: proximaRevisao,
			AssuntoID:          uint(assuntoID),
		}

		if err := flashcard.SalvarFlashcard(db, c.Request.Context(), &newCard, usuarioID); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, newCard)
	}
}
