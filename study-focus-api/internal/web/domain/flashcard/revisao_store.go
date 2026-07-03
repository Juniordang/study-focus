package flashcard

import (
	"errors"
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func ListarParaRevisao(db *gorm.DB, usuarioID uint) ([]schema.Flashcard, error) {
	var flashcards []schema.Flashcard
	now := time.Now()

	err := db.
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("disciplinas.usuario_id = ?", usuarioID).
		Where("flashcards.data_proxima_revisao <= ?", now).
		Find(&flashcards).Error

	return flashcards, err
}

func RegistrarRevisao(db *gorm.DB, flashcardID uint, usuarioID uint, desempenho string, proximaRevisao time.Time, nivel int) error {
	var count int64
	err := db.Model(&schema.Flashcard{}).
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("flashcards.id = ? AND disciplinas.usuario_id = ?", flashcardID, usuarioID).
		Count(&count).Error

	if err != nil {
		return err
	}
	if count == 0 {
		return errors.New("flashcard não encontrado ou não pertence ao usuário")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&schema.Flashcard{}).Where("id = ?", flashcardID).
			Updates(map[string]interface{}{
				"data_proxima_revisao": proximaRevisao,
				"nivel_dificuldade":    nivel,
			}).Error; err != nil {
			return err
		}

		historico := schema.HistoricoRevisoes{
			FlashcardID: flashcardID,
			DataRevisao: time.Now(),
			Desempenho:  desempenho,
		}
		if err := tx.Create(&historico).Error; err != nil {
			return err
		}

		return nil
	})
}

func ListarHistoricoRevisoes(db *gorm.DB, usuarioID uint) ([]HistoricoRevisaoDTO, error) {
	var historico []HistoricoRevisaoDTO

	err := db.Table("historico_revisoes").
		Select(`
			historico_revisoes.id,
			historico_revisoes.data_revisao,
			historico_revisoes.desempenho,
			historico_revisoes.flashcard_id,
			flashcards.pergunta,
			flashcards.resposta,
			flashcards.data_proxima_revisao,
			flashcards.nivel_dificuldade,
			assuntos.id AS assunto_id,
			assuntos.nome AS assunto_nome,
			disciplinas.id AS disciplina_id,
			disciplinas.nome AS disciplina_nome
		`).
		Joins("JOIN flashcards ON flashcards.id = historico_revisoes.flashcard_id").
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("disciplinas.usuario_id = ?", usuarioID).
		Order("historico_revisoes.data_revisao desc").
		Scan(&historico).Error

	return historico, err
}
