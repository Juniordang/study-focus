package chaveapi

import (
	"context"
	"errors"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func SalvarChaveIA(ctx context.Context, db *gorm.DB, config *schema.ChaveIA) error {
	return db.WithContext(ctx).Create(config).Error
}

func AtualizarChaveIA(ctx context.Context, db *gorm.DB, usuarioID uint, provedor string, chaveApi string) (*schema.ChaveIA, error) {
	var config schema.ChaveIA

	if err := db.WithContext(ctx).
		Where("usuario_id = ? AND provedor = ?", usuarioID, provedor).
		Order("created_at desc").
		First(&config).Error; err != nil {
		return nil, err
	}

	config.ChaveApi = chaveApi

	if err := db.WithContext(ctx).Save(&config).Error; err != nil {
		return nil, err
	}

	return &config, nil
}

func BuscarChaveIA(db *gorm.DB, usuarioID uint) ([]schema.ChaveIA, error) {
	var configs []schema.ChaveIA

	var err error
	err = db.Where("usuario_id = ?", usuarioID).Find(&configs).Error

	if len(configs) == 0 {
		return nil, errors.New("Sem chave de api cadastrada!")
	}

	return configs, err
}
