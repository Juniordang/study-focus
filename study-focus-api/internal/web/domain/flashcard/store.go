package flashcard

import (
	"context"
	"errors"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func Listar(db *gorm.DB, disciplinaID uint) ([]schema.Flashcard, error) {
	var flashcards []schema.Flashcard

	err := db.
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Where("assuntos.disciplina_id = ?", disciplinaID).
		Find(&flashcards).Error

	return flashcards, err
}

func SalvarFlashcard(db *gorm.DB, ctx context.Context, card *schema.Flashcard, usuarioID uint) error {
	var assunto schema.Assunto

	err := db.WithContext(ctx).
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("assuntos.id = ? AND disciplinas.usuario_id = ?", card.AssuntoID, usuarioID).
		First(&assunto).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("assunto não encontrado ou não pertence ao usuário")
		}
		return err
	}

	return db.WithContext(ctx).Create(card).Error
}

func AtualizarFlashcard(db *gorm.DB, ctx context.Context, flashcardID uint, usuarioID uint, pergunta string, resposta string, assuntoID uint, nivel int) (*schema.Flashcard, error) {
	var card schema.Flashcard
	err := db.WithContext(ctx).
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("flashcards.id = ? AND disciplinas.usuario_id = ?", flashcardID, usuarioID).
		First(&card).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("flashcard não encontrado ou não pertence ao usuário")
		}
		return nil, err
	}

	var assunto schema.Assunto
	err = db.WithContext(ctx).
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("assuntos.id = ? AND disciplinas.usuario_id = ?", assuntoID, usuarioID).
		First(&assunto).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("assunto não encontrado ou não pertence ao usuário")
		}
		return nil, err
	}

	updates := map[string]interface{}{
		"pergunta":   pergunta,
		"resposta":   resposta,
		"assunto_id": assuntoID,
	}

	if nivel > 0 {
		proximaRevisao, err := CalcularProximaRevisao(nivel)
		if err != nil {
			return nil, err
		}
		updates["nivel_dificuldade"] = nivel
		updates["data_proxima_revisao"] = proximaRevisao
	}

	if err := db.WithContext(ctx).Model(&card).Updates(updates).Error; err != nil {
		return nil, err
	}

	if err := db.WithContext(ctx).First(&card, flashcardID).Error; err != nil {
		return nil, err
	}

	return &card, nil
}

func DeleteFlashcard(db *gorm.DB, flashcardID uint, usuarioID uint) error {
	var card schema.Flashcard
	err := db.
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("flashcards.id = ? AND disciplinas.usuario_id = ?", flashcardID, usuarioID).
		First(&card).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("flashcard não encontrado ou não pertence ao usuário")
		}
		return err
	}

	return db.Delete(&card).Error
}
