package handlerchaveapi

import (
	"errors"
	"net/http"

	chaveapi "github.com/Juniordang/study-focus-api/internal/web/domain/chave-api"
	"github.com/Juniordang/study-focus-api/internal/web/domain/ia"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdateApiKey(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado ou inválido")
			// c.JSON(http.StatusUnauthorized, gin.H{"error": })
			return
		}

		var payload ChaveApiRequest
		if err := c.ShouldBindJSON(&payload); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		config, err := chaveapi.AtualizarChaveIA(c.Request.Context(), db, usuarioID, payload.Provedor, payload.ChaveApi)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				handlers.SendError(c, http.StatusNotFound, "Chave de API não encontrada")
				return
			}

			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusOK, ia.ToChaveIAResponse(*config))
	}
}
