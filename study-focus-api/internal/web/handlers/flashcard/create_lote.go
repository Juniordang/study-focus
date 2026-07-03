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

type FlashcardBatchRequest struct {
	Flashcards []FlashcardRequest `json:"flashcards" binding:"required"`
}

func CreateLote(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		var req FlashcardBatchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		var cardsToInsert []schema.Flashcard

		for _, item := range req.Flashcards {
			if item.AssuntoID == "" {
				continue
			}
			id, err := strconv.ParseUint(item.AssuntoID, 10, 32)
			if err != nil {
				continue
			}

			nivel := item.Nivel
			if nivel == 0 {
				nivel = 3
			}

			proximaRevisao, _ := flashcard.CalcularProximaRevisao(nivel)

			cardsToInsert = append(cardsToInsert, schema.Flashcard{
				Pergunta:           item.Pergunta,
				Resposta:           item.Resposta,
				NivelDificuldade:   nivel,
				DataProximaRevisao: proximaRevisao,
				AssuntoID:          uint(id),
			})
		}

		if len(cardsToInsert) == 0 {
			handlers.SendError(c, http.StatusBadRequest, "Nenhum flashcard válido para inserir")
			return
		}

		if err := db.Create(&cardsToInsert).Error; err != nil {
			handlers.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, gin.H{"message": "Flashcards inseridos com sucesso", "count": len(cardsToInsert)})
	}
}
