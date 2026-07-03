package agenda

import (
	"errors"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func SalvarAgenda(db *gorm.DB, payload *schema.SessaoEstudo) error {
	return db.Create(payload).Error
}

func DeletarSessao(db *gorm.DB, sessaoID uint, usuarioID uint) error {
	var sessao schema.SessaoEstudo
	err := db.Where("id = ? AND usuario_id = ?", sessaoID, usuarioID).First(&sessao).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("sessão não encontrada ou não pertence ao usuário")
		}
		return err
	}

	return db.Delete(&sessao).Error
}
