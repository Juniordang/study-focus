package handlerdisciplina

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/web/domain/disciplina"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Update(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "usuário não autenticado")
			return
		}

		disciplinaIDParam := c.Param("id")
		disciplinaID, err := strconv.ParseUint(disciplinaIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "id da disciplina inválido")
			return
		}

		var req DisciplinaRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		var assuntosInput []disciplina.AssuntoInput
		for _, a := range req.Assuntos {
			assuntosInput = append(assuntosInput, disciplina.AssuntoInput{
				ID:   a.ID,
				Nome: a.Nome,
			})
		}

		updatedDisciplina, updatedAssuntos, err := disciplina.AtualizaDisciplinaEAssuntos(
			db,
			c.Request.Context(),
			usuarioID,
			uint(disciplinaID),
			req.Nome,
			req.Descricao,
			disciplina.ValidarCor(req.Cor),
			assuntosInput,
		)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				handlers.SendError(c, http.StatusNotFound, "disciplina não encontrada")
			} else {
				handlers.SendError(c, http.StatusBadRequest, err.Error())
			}
			return
		}

		handlers.SendSuccess(c, http.StatusOK, DisciplinaResponse{
			Disciplina: *updatedDisciplina,
			Assuntos:   updatedAssuntos,
		})
	}
}
