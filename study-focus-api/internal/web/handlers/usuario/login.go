package handlerusuario

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/web/domain/usuario"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/Juniordang/study-focus-api/internal/web/middleware/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required,min=8"`
}

func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LoginRequest

		if err := c.ShouldBindJSON(&input); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		user, err := usuario.BuscarPorEmail(db, input.Email)
		if err != nil {
			handlers.SendError(c, http.StatusConflict, "E-mail ou senha incorretos")
			return
		}

		if err := usuario.VerificarSenha(user.Senha, input.Senha); err != nil {
			handlers.SendError(c, http.StatusBadRequest, "E-mail ou senha incorretos")
			return
		}

		tokenGerado, err := auth.GerarTokenJWT(user.ID)
		if err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "erro ao gerar chave de acesso")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, gin.H{
			"token": tokenGerado,
		})
	}
}
