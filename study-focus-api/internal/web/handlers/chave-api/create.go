package handlerchaveapi

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	chaveapi "github.com/Juniordang/study-focus-api/internal/web/domain/chave-api"
	"github.com/Juniordang/study-focus-api/internal/web/domain/ia"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SaveApiKey(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		var payload ChaveApiRequest

		if err := c.ShouldBindJSON(&payload); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		config := schema.ChaveIA{
			ChaveApi:  payload.ChaveApi,
			Provedor:  payload.Provedor,
			UsuarioID: usuarioID,
		}

		if err := chaveapi.SalvarChaveIA(c.Request.Context(), db, &config); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, ia.ToChaveIAResponse(config))
	}
}
