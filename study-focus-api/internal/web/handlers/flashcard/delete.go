package handlerflashcard

import (
	"net/http"
	"strconv"

	domain "github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Delete(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		flashcardIDParam := c.Param("id")
		flashcardID, err := strconv.ParseUint(flashcardIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do flashcard inválido")
			return
		}

		err = domain.DeleteFlashcard(db, uint(flashcardID), usuarioID)
		if err != nil {
			if err.Error() == "flashcard não encontrado ou não pertence ao usuário" {
				handlers.SendError(c, http.StatusNotFound, err.Error())
				return
			}
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao excluir flashcard")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, nil)
	}
}
