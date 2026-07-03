package handleria

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/web/domain/ia"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func List(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		historico, err := ia.ListarPorUsuarioID(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao buscar histórico da IA")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, historico)
	}
}
