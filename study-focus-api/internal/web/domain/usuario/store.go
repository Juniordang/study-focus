package usuario

import (
	"context"
	"errors"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func BuscarTempos(db *gorm.DB, usuario *schema.Usuario) error {

	g := db.First(&usuario, "id = ?", &usuario.ID)
	if g.Error != nil {
		return g.Error
	}

	return nil
}

func AtualizarConfig(db *gorm.DB, usuarioID uint, focoPadrao, descansoPadrao, descansoLongo int) (*schema.Usuario, error) {
	var user schema.Usuario

	if g := db.First(&user, "id = ?", usuarioID); g.Error != nil {
		return nil, errors.New(g.Error.Error())
	}

	updates := map[string]interface{}{
		"tempo_descanso_padrao":    descansoPadrao,
		"tempo_foco_padrao":        focoPadrao,
		"tempo_pausa_longa_padrao": descansoLongo,
	}

	if err := db.Model(&user).Updates(updates); err.Error != nil {
		return nil, errors.New(err.Error.Error())
	}

	return &user, nil
}

func Salvar(ctx context.Context, db *gorm.DB, usuario *schema.Usuario) error {
	return db.WithContext(ctx).Create(usuario).Error

}

func BuscarPorEmail(db *gorm.DB, email string) (*schema.Usuario, error) {
	var user schema.Usuario

	g := db.First(&user, "email = ?", email)
	if g.Error != nil {
		return nil, g.Error
	}

	return &user, nil

}
