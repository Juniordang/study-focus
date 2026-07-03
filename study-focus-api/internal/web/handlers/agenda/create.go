package handleragenda

import (
	"net/http"
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/agenda"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateSessao(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		var req AgendaRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		parsedTime, err := time.Parse(time.RFC3339, req.Data)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "formato de data inválido, use ISO 8601")
			return
		}

		now := time.Now()
		if now.After(parsedTime) {
			handlers.SendError(c, http.StatusBadRequest, "Esse Horário já passou")
			return
		}

		novaSessao := schema.SessaoEstudo{
			Titulo:     req.Titulo,
			Descricao:  req.Descricao,
			Data:       parsedTime,
			Prioridade: req.Prioridade,
			UsuarioID:  usuarioID,
			AssuntoID:  req.AssuntoID,
		}

		if err := agenda.SalvarAgenda(db, &novaSessao); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Banco indisponível")
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, novaSessao)
	}
}
