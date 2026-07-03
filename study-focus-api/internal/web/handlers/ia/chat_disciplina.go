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

type ChatDisciplinaRequest struct {
	DisciplinaID uint   `json:"disciplina_id" binding:"required"`
	AssuntoID    uint   `json:"assunto_id" binding:"required"`
	Pergunta     string `json:"pergunta" binding:"required"`
}

type ChatDisciplinaResponse struct {
	Resposta   string    `json:"resposta"`
	Flashcards []ia.Card `json:"flashcards"`
}

func ChatIaDisciplina(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		var req ChatDisciplinaRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		if err := ia.ValidateChat(req.Pergunta); err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, err.Error())
			return
		}

		// Buscar Disciplina e Assunto para ter o contexto
		var disciplina schema.Disciplina
		if err := db.First(&disciplina, req.DisciplinaID).Error; err != nil {
			handlers.SendError(c, http.StatusNotFound, "Disciplina não encontrada")
			return
		}

		var assunto schema.Assunto
		if err := db.First(&assunto, req.AssuntoID).Error; err != nil {
			handlers.SendError(c, http.StatusNotFound, "Assunto não encontrado")
			return
		}

		// Obter chaves de API
		configs, err := chaveapi.BuscarChaveIA(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, err.Error())
			return
		}

		providers := ia.MakeProviders(configs)

		// Prompt estruturado com contexto
		promptContext := ia.BuildDisciplinaChatPrompt(disciplina.Nome, assunto.Nome, req.Pergunta)

		res, err := providers.Ask(c.Request.Context(), promptContext)
		if err != nil {
			handlers.SendError(c, http.StatusUnprocessableEntity, "Erro ao buscar resposta. Tente novamente mais tarde!!")
			return
		}

		resFormatted, cards := ia.FormatResponseIA(res)

		// Preenchendo as FKs usando ponteiros
		discID := uint(req.DisciplinaID)
		assID := uint(req.AssuntoID)
		newChat := schema.HistoricoIA{
			UsuarioID:    usuarioID,
			DisciplinaID: &discID,
			AssuntoID:    &assID,
			Pergunta:     req.Pergunta,
			Resposta:     resFormatted,
		}

		if err := ia.SalvarChat(db, &newChat); err != nil {
			handlers.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}

		handlers.SendSuccess(c, http.StatusCreated, ChatDisciplinaResponse{
			Resposta:   newChat.Resposta,
			Flashcards: cards,
		})
	}
}
