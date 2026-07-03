package web

import (
	"github.com/Juniordang/study-focus-api/internal/data/conf"
	handleragenda "github.com/Juniordang/study-focus-api/internal/web/handlers/agenda"
	handlerchaveapi "github.com/Juniordang/study-focus-api/internal/web/handlers/chave-api"
	handlerdashboard "github.com/Juniordang/study-focus-api/internal/web/handlers/dashboard"
	handlerdisciplina "github.com/Juniordang/study-focus-api/internal/web/handlers/disciplina"
	handlerflashcard "github.com/Juniordang/study-focus-api/internal/web/handlers/flashcard"
	handleria "github.com/Juniordang/study-focus-api/internal/web/handlers/ia"
	handlerpomodoro "github.com/Juniordang/study-focus-api/internal/web/handlers/pomodoro"
	handlerusuario "github.com/Juniordang/study-focus-api/internal/web/handlers/usuario"
	"github.com/Juniordang/study-focus-api/internal/web/middleware"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(r *gin.Engine) {
	db := conf.GetSqlite()

	v1 := r.Group("/api/v1")

	{
		users := v1.Group("/usuarios")

		users.POST("", handlerusuario.CriarUsuario(db))
		users.POST("/login", handlerusuario.Login(db))

		protected := users.Group("/me")
		protected.Use(middleware.AutenticaoJWT())
		{
			protected.PATCH("/config", handlerusuario.UpdateTempos(db))
			protected.GET("/tempos", handlerusuario.GetConfigPomodoro(db))
			protected.PATCH("/tempos", handlerusuario.UpdateTempos(db))

			protected.GET("/chave-api", handlerchaveapi.GetApiKeys(db))
			protected.POST("/chave-api", handlerchaveapi.SaveApiKey(db))
			protected.PUT("/chave-api", handlerchaveapi.UpdateApiKey(db))

			protected.POST("/disciplinas", handlerdisciplina.Create(db))
			protected.GET("/disciplinas", handlerdisciplina.ListarDisciplinas(db))
			protected.PUT("/disciplinas/:id", handlerdisciplina.Update(db))
			protected.DELETE("/disciplinas/:id", handlerdisciplina.Delete(db))

			protected.POST("disciplinas/:id/flashcards", handlerflashcard.Create(db))
			protected.GET("disciplinas/:id/flashcards", handlerflashcard.ListarFlashcards(db))
			protected.POST("/flashcards/lote", handlerflashcard.CreateLote(db))

			protected.GET("/flashcards/revisar", handlerflashcard.ListarParaRevisao(db))
			protected.PATCH("/flashcards/:id/revisar", handlerflashcard.SalvarRevisao(db))
			protected.GET("/historico_revisoes", handlerflashcard.ListarHistoricoRevisao(db))
			protected.PUT("/flashcards/:id", handlerflashcard.Update(db))
			protected.DELETE("/flashcards/:id", handlerflashcard.Delete(db))

			protected.POST("/pomodoro", handlerpomodoro.CreatePomodoro(db))
			protected.GET("/pomodoro/sessoes/:sessaoId/ciclos", handlerpomodoro.GetCiclos(db))

			protected.POST("/historico_ia", handleria.Create(db))
			protected.POST("/ia/disciplina", handleria.ChatIaDisciplina(db))
			protected.GET("/historico_ia", handleria.List(db))

			protected.POST("/sessao", handleragenda.CreateSessao(db))
			protected.POST("/sessao/validar", handleragenda.ValidateSessao(db))
			protected.GET("/sessao", handleragenda.ListarSessoes(db))
			protected.DELETE("/sessao/:id", handleragenda.DeleteSessao(db))

			protected.GET("/dashboard", handlerdashboard.GetDashboard(db))
		}
	}

}
