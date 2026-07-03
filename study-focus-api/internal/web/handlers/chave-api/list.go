package handlerchaveapi

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/ia"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetApiKeys(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		var configs []schema.ChaveIA
		if err := db.Where("usuario_id = ?", usuarioID).Order("created_at desc").Find(&configs).Error; err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao buscar chaves de API")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, ia.ToChaveIAResponses(configs))
	}
}
