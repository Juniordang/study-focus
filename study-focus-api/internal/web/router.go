package web

import (
	"os"
	"time"

	"github.com/Juniordang/study-focus-api/cmd/config"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Initialize() error {
	logger := config.Newlogger("router")
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:5174",
			"http://127.0.0.1:5174",
			"http://localhost:5175",
			"http://127.0.0.1:5175",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	InitializeRoutes(router)

	port := os.Getenv("PORT")
	if err := router.Run(":" + port); err != nil {
		logger.Errf("error on start server: %v", err)
		return err
	}

	return nil
}
