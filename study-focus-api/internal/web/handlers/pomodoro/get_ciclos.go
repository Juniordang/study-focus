package handlerpomodoro

import (
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/web/domain/pomodoro"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CiclosResponse struct {
	Ciclos uint `json:"ciclos_concluidos"`
}

func GetCiclos(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 1 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado ou inválido")
			return
		}

		sessaoEstudoIdParam := c.Param("sessaoId")
		sessaoId, err := strconv.ParseUint(sessaoEstudoIdParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do flashcard inválido")
			return
		}

		ciclos := pomodoro.GetCiclos(db, uint(sessaoId))

		handlers.SendSuccess(c, http.StatusOK, CiclosResponse{Ciclos: uint(ciclos)})

	}
}
