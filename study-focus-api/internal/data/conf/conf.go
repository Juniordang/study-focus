package conf

import (
	"fmt"
	"os"

	"gorm.io/gorm"
)

type Config struct {
	Port string
	DNS  string
}

var db *gorm.DB

func Init() error {
	var err error

	db, err = IntializeSQLite()
	if err != nil {
		return fmt.Errorf("error initializing sqlite: %v", err)
	}

	return nil
}

func GetSqlite() *gorm.DB {
	return db
}

func Load() Config {
	port := os.Getenv("PORT")
	dbPath := os.Getenv("DB_PATH")

	return Config{
		Port: ":" + port,
		DNS:  "./" + dbPath + "?_pragma=foreign_keys(1)",
	}
}
