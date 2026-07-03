package handlerflashcard

import (
	"net/http"
	"strconv"

	domain "github.com/Juniordang/study-focus-api/internal/web/domain/flashcard"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListarParaRevisao(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		flashcards, err := domain.ListarParaRevisao(db, usuarioID)
		if err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao buscar flashcards para revisão")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, flashcards)
	}
}

func SalvarRevisao(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioID := c.GetUint("userID")
		if usuarioID == 0 {
			handlers.SendError(c, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		flashcardIDParam := c.Param("id")
		flashcardID, err := strconv.ParseUint(flashcardIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "ID do flashcard inválido")
			return
		}

		var req struct {
			Desempenho string `json:"desempenho"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			handlers.SendError(c, http.StatusBadRequest, "Corpo da requisição inválido")
			return
		}

		var nivel int
		switch req.Desempenho {
		case "Facil":
			nivel = 1
		case "Medio":
			nivel = 2
		case "Dificil":
			nivel = 3
		default:
			handlers.SendError(c, http.StatusBadRequest, "Desempenho inválido: use Facil, Medio ou Dificil")
			return
		}

		proximaRevisao, err := domain.CalcularProximaRevisao(nivel)
		if err != nil {
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao calcular próxima revisão")
			return
		}

		err = domain.RegistrarRevisao(db, uint(flashcardID), usuarioID, req.Desempenho, proximaRevisao, nivel)
		if err != nil {
			if err.Error() == "flashcard não encontrado ou não pertence ao usuário" {
				handlers.SendError(c, http.StatusNotFound, err.Error())
				return
			}
			handlers.SendError(c, http.StatusInternalServerError, "Erro ao registrar revisão")
			return
		}

		handlers.SendSuccess(c, http.StatusOK, gin.H{"proxima_revisao": proximaRevisao})
	}
}
