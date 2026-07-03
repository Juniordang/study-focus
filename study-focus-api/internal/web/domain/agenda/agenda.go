package agenda

import (
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func VerificarConflito(db *gorm.DB, usuarioID uint, prioridade string, inicio time.Time, tempoFinal time.Time, count *int64) error {
	return db.Model(&schema.SessaoEstudo{}).
		Where("usuario_id = ?", usuarioID).
		Where("prioridade = ?", prioridade).
		Where("data BETWEEN ? AND ?", inicio, tempoFinal).
		Count(count).Error
}
