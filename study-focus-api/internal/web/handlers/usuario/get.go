package handlerusuario

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/usuario"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetConfigPomodoro(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado ou inválido")
			return
		}

		usuarioItem := schema.Usuario{
			Model: gorm.Model{ID: usuarioID},
		}

		if err := usuario.BuscarTempos(db, &usuarioItem); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao buscar tempos")
			return
		}

		handlers.SendSuccess(c, http.StatusOK,
			ConfiguracoesTempo{
				TempoFoco:       usuarioItem.TempoFocoPadrao,
				TempoDescanso:   usuarioItem.TempoDescansoPadrao,
				TempoPausaLonga: usuarioItem.TempoPausaLongaPadrao,
			},
		)
	}
}
