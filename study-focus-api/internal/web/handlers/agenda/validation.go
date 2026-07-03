package handleragenda

import (
	"net/http"
	"time"

	"github.com/Juniordang/study-focus-api/internal/web/domain/agenda"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ValidateSessao(db *gorm.DB) gin.HandlerFunc {
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

		vinteCincoMin := 25 * time.Minute
		inicio := parsedTime.Add(-vinteCincoMin)
		tempoFinal := parsedTime.Add(vinteCincoMin)

		var count int64

		if err := agenda.VerificarConflito(db, usuarioID, req.Prioridade, inicio, tempoFinal, &count); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "erro ao validar sessão de estudo")
			return
		}

		if count > 0 {
			handlers.SendError(c, http.StatusConflict, "já existe uma sessão de estudo neste horário com a mesma prioridade")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, gin.H{"message": "Sem conflitos"})
	}
}
