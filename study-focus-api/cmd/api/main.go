package main

import (
	"github.com/Juniordang/study-focus-api/cmd/config"
	"github.com/Juniordang/study-focus-api/internal/data/conf"
	"github.com/Juniordang/study-focus-api/internal/web"
	"github.com/joho/godotenv"
)

var logger *config.Logger

func main() {
	logger = config.Newlogger("main")
	_ = godotenv.Load()

	err := conf.Init()
	if err != nil {
		logger.Errf("config initialization error: %v", err)
		return
	}

	err = web.Initialize()
	if err != nil {
		logger.Errf("server initialization error: %v", err)
		return
	}
}
