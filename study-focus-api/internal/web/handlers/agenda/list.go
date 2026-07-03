package handleragenda

import (
	"net/http"
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListarSessoes(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		query := db.Where("usuario_id = ?", usuarioID)
		data := c.Query("data")
		if data != "" {
			parsedDate, err := time.ParseInLocation("2006-01-02", data, time.Local)
			if err != nil {
				handlers.SendError(c, http.StatusBadRequest, "formato de data inválido, use YYYY-MM-DD")
				return
			}

			inicioDia := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 0, 0, 0, 0, parsedDate.Location())
			fimDia := inicioDia.Add(24 * time.Hour)
			query = query.Where("data >= ? AND data < ?", inicioDia, fimDia)
		}

		var eventos []schema.SessaoEstudo
		if err := query.Order("data ASC").Find(&eventos).Error; err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "falha ao listar eventos")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, eventos)
	}
}
