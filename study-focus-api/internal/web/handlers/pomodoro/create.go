package handlerpomodoro

import (
	"net/http"
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/pomodoro"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PomodoroRequest struct {
	SessaoEstudoID *uint  `json:"sessao_estudo_id"`
	Fase           string `json:"fase"`
	Duracao        int    `json:"duracao_minutos" binding:"required"`
	Ciclos         int    `json:"ciclos"`
}

func CreatePomodoro(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado ou inválido")

			return
		}

		var req PomodoroRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, "Dados de envio inválidos: "+err.Error())
			return
		}

		fase := pomodoro.NormalizarFase(req.Fase)
		if err := pomodoro.ValidarSessao(req.Duracao, fase, req.SessaoEstudoID); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		newPomodoro := schema.Pomodoro{
			DataExecucao:     time.Now(),
			Fase:             fase,
			DuracaoMinutos:   req.Duracao,
			CiclosConcluidos: req.Ciclos,
			SessaoEstudoID:   req.SessaoEstudoID,
		}

		if err := pomodoro.SalvarPomodoro(db, &newPomodoro, usuarioID); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao salvar pomodoro no banco de dados: "+err.Error())
			return
		}

		c.JSON(http.StatusCreated, newPomodoro)
	}
}
