package handlerusuario

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/usuario"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CriarUsuarioRequest struct {
	Nome  string `json:"nome" binding:"required"`
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required,min=8"`
}

type UsuarioResponse struct {
	ID                    uint   `json:"id"`
	Email                 string `json:"email"`
	Nome                  string `json:"nome"`
	TempoFocoPadrao       int    `json:"tempoFocoPadrao"`
	TempoDescansoPadrao   int    `json:"tempoDescansoPadrao"`
	TempoPausaLongaPadrao int    `json:"tempoPausaLongaPadrao"`
}

func CriarUsuario(db *gorm.DB) gin.HandlerFunc {

	return func(c *gin.Context) {
		var input CriarUsuarioRequest

		if err := c.ShouldBindJSON(&input); err != nil {
			handlers.SendError(c, http.StatusBadRequest, "E-mail ou senha incorretos")
			return
		}

		var usuarioCreated schema.Usuario

		password, errMsg := usuario.GenerateHash(input.Senha)
		if errMsg != nil {
			handlers.SendError(c, http.StatusBadRequest, "E-mail ou senha incorretos")
			return
		}

		usuarioCreated = schema.Usuario{
			Nome:  input.Nome,
			Email: input.Email,
			Senha: *password,
		}

		if err := usuario.Salvar(c.Request.Context(), db, &usuarioCreated); err != nil {
			handlers.SendError(c, http.StatusBadRequest, "Falha interna no servidor, tente mais tarde")
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, gin.H{
			"usuario": UsuarioResponse{
				ID:                    usuarioCreated.ID,
				Email:                 usuarioCreated.Email,
				Nome:                  usuarioCreated.Nome,
				TempoFocoPadrao:       usuarioCreated.TempoFocoPadrao,
				TempoDescansoPadrao:   usuarioCreated.TempoDescansoPadrao,
				TempoPausaLongaPadrao: usuarioCreated.TempoPausaLongaPadrao,
			},
		})

	}
}
