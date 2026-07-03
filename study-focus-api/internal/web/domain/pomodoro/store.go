package pomodoro

import (
	"errors"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func GetCiclos(db *gorm.DB, sessaoEstudoID uint) int64 {
	var ciclos int64

	err := db.Model(&schema.Pomodoro{}).Where("sessao_estudo_id = ? AND fase = ?", sessaoEstudoID, "foco").Count(&ciclos).Error

	if err != nil {
		return 0
	}

	return ciclos
}

func SalvarPomodoro(db *gorm.DB, pomodoro *schema.Pomodoro, usuarioID uint) error {
	if pomodoro.SessaoEstudoID == nil {
		return db.Create(pomodoro).Error
	}

	var sessao schema.SessaoEstudo

	err := db.Where("id = ? AND usuario_id = ?", *pomodoro.SessaoEstudoID, usuarioID).First(&sessao).Error
	if err != nil {
		return errors.New("sessão inválida")
	}

	return db.Create(pomodoro).Error
}
