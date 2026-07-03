package handlerflashcard

import (
	"errors"
	"net/http"
	"strconv"

	domain "github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Update(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "usuário não autenticado")
			return
		}

		flashcardIDParam := c.Param("id")
		flashcardID, err := strconv.ParseUint(flashcardIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do flashcard inválido")
			return
		}

		var req FlashcardRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		if req.AssuntoID == "" {
			handlers.SendError(c, http.StatusBadRequest, "o ID do assunto é obrigatório")
			return
		}

		assuntoID, err := strconv.ParseUint(req.AssuntoID, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do assunto inválido")
			return
		}

		updatedCard, err := domain.AtualizarFlashcard(
			db,
			c.Request.Context(),
			uint(flashcardID),
			usuarioID,
			req.Pergunta,
			req.Resposta,
			uint(assuntoID),
			req.Nivel,
		)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) ||
				err.Error() == "flashcard não encontrado ou não pertence ao usuário" ||
				err.Error() == "assunto não encontrado ou não pertence ao usuário" {
				handlers.SendError(c, http.StatusNotFound, err.Error())
				return
			}

			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusOK, updatedCard)
	}
}
