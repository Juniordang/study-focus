package handlerflashcard

import (
	"net/http"

	domain "github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListarHistoricoRevisao(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		historico, err := domain.ListarHistoricoRevisoes(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao buscar histórico de revisões")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, historico)
	}
}
