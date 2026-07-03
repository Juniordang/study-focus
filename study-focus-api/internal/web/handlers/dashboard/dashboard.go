package handlerdashboard

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/web/domain/dashboard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetDashboard(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pega o ID do usuário injetado pelo seu middleware JWT
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		stats, err := dashboard.CalcularEstatisticas(db, usuarioID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar estatísticas"})
			return
		}

		handlers.SendSuccess(c, http.StatusOK, stats)
	}

}
