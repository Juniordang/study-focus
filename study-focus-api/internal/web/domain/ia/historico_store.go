package ia

import (
	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func SalvarChat(db *gorm.DB, chat *schema.HistoricoIA) error {
	return db.Create(chat).Error
}

func ListarPorUsuarioID(db *gorm.DB, usuarioID uint) ([]schema.HistoricoIA, error) {
	var historico []schema.HistoricoIA
	err := db.Where("usuario_id = ?", usuarioID).Order("created_at desc").Find(&historico).Error
	return historico, err
}
