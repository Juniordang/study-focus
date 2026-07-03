package handleria

import (
	"net/http"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	chaveapi "github.com/Juniordang/study-focus-api/internal/web/domain/chave-api"
	"github.com/Juniordang/study-focus-api/internal/web/domain/ia"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Create(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		var req ChatRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		if err := ia.ValidateChat(req.Pergunta); err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, err.Error())
			return
		}

		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		configs, err := chaveapi.BuscarChaveIA(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, err.Error())
			return
		}

		providers := ia.MakeProviders(configs)
		prompt := ia.BuildGlobalChatPrompt(req.Pergunta)
		res, err := providers.Ask(c.Request.Context(), prompt)
		if err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, err.Error())
			return
		}

		resFormatted, _ := ia.FormatResponseIA(res)

		newChat := schema.HistoricoIA{
			UsuarioID: usuarioID,
			Pergunta:  req.Pergunta,
			Resposta:  resFormatted,
		}

		if err := ia.SalvarChat(db, &newChat); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, ChatResponse{
			Resposta: newChat.Resposta,
		})
	}
}
