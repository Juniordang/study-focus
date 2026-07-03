package handlerdisciplina

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/disciplina"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Create(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusBadRequest, "user not exists")
			return
		}

		var req DisciplinaRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		cleanName, err := disciplina.ValidarNome(req.Nome)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		payload := schema.Disciplina{
			Nome:      cleanName,
			Descricao: req.Descricao,
			Cor:       disciplina.ValidarCor(req.Cor),
			UsuarioID: usuarioID,
		}

		if err := disciplina.SalvarDisciplina(db, c.Request.Context(), &payload); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		var payloadAssuntos []schema.Assunto

		for _, assunto := range req.Assuntos {
			cleanAssuntoName, err := disciplina.ValidarNome(assunto.Nome)
			if err == nil {
				payloadAssuntos = append(payloadAssuntos, schema.Assunto{
					Nome:         cleanAssuntoName,
					DisciplinaID: payload.ID,
				})
			}
		}

		if err := disciplina.SalvarAssunto(db, c.Request.Context(), &payloadAssuntos); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, DisciplinaResponse{
			Disciplina: payload,
			Assuntos:   payloadAssuntos,
		})

	}
}
