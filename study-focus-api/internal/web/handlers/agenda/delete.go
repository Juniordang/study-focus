package handleragenda

import (
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/web/domain/agenda"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeleteSessao(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado ou inválido"})
			return
		}

		sessaoIDParam := c.Param("id")
		sessaoID, err := strconv.ParseUint(sessaoIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID da sessão inválido")
			return
		}

		if err := agenda.DeletarSessao(db, uint(sessaoID), usuarioID); err != nil {
			if err.Error() == "sessão não encontrada ou não pertence ao usuário" {
				handlers.SendError(c, http.StatusNotFound, err.Error())
				return
			}
			handlers.SendError(c, http.StatusInternalServerError, "erro ao excluir sessão")
			return
		}

		c.Status(http.StatusNoContent)
	}
}
