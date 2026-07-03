package handlerusuario

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/web/domain/usuario"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ConfiguracoesTempo struct {
	TempoFoco       int `json:"tempo_foco"`
	TempoDescanso   int `json:"tempo_pausa_curta"`
	TempoPausaLonga int `json:"tempo_pausa_longa"`
}

func UpdateTempos(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")

		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado ou inválido")
			return
		}

		var req ConfiguracoesTempo
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		if err := usuario.ValidarConfiguracoes(req.TempoFoco, req.TempoDescanso, req.TempoPausaLonga); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		user, err := usuario.AtualizarConfig(db, usuarioID, req.TempoFoco, req.TempoDescanso, req.TempoPausaLonga)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusOK, *user)

	}
}
