package handlerdisciplina

import (
	"fmt"
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/web/domain/disciplina"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListarDisciplinas(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		id, exists := c.Get("userID")
		if !exists {
			handlers.SendError(c, http.StatusBadRequest, "user not exists")
			return
		}
		usuarioID := id.(uint)

		disciplinas, err := disciplina.BuscarDisciplinasComAssuntos(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusNotFound, err.Error())
			return
		}

		var resp []map[string]interface{}
		for _, d := range disciplinas {
			var cardCount int
			for _, a := range d.Assuntos {
				cardCount += len(a.FlashCards)
			}

			resp = append(resp, map[string]interface{}{
				"id":          fmt.Sprint(d.ID),
				"name":        d.Nome,
				"description": d.Descricao,
				"color":       d.Cor,
				"assuntos":    d.Assuntos,
				"cardCount":   cardCount,
			})
		}

		if resp == nil {
			resp = []map[string]interface{}{}
		}

		handlers.SendSuccess(c, http.StatusOK, resp)
	}
}
