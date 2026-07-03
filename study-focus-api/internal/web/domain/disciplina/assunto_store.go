package disciplina

import (
	"context"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)
type AssuntoInput struct {
	ID   string
	Nome string
}


func SalvarAssunto(db *gorm.DB, ctx context.Context, assunto *[]schema.Assunto) error {
	return db.WithContext(ctx).Create(assunto).Error
}

