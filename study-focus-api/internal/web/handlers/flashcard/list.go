package handlerflashcard

import (
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListarFlashcards(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		disciplinaIDStr := c.Param("id")
		disciplinaID, _ := strconv.ParseUint(disciplinaIDStr, 10, 32)

		cards, err := flashcard.Listar(db, uint(disciplinaID))
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, cards)
	}
}
