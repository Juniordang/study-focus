package flashcard

import (
	"testing"
	"time"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func TestDeleteFlashcardSoftDeletesCardAndReviewHistory(t *testing.T) {
	db := setupFlashcardTestDB(t)

	usuario := schema.Usuario{
		Nome:  "Aluno",
		Email: "aluno@example.com",
		Senha: "secret",
	}
	if err := db.Create(&usuario).Error; err != nil {
		t.Fatalf("Create usuario: %v", err)
	}

	disciplina := schema.Disciplina{
		Nome:      "Go",
		UsuarioID: usuario.ID,
	}
	if err := db.Create(&disciplina).Error; err != nil {
		t.Fatalf("Create disciplina: %v", err)
	}

	assunto := schema.Assunto{
		Nome:         "Mapas",
		DisciplinaID: disciplina.ID,
	}
	if err := db.Create(&assunto).Error; err != nil {
		t.Fatalf("Create assunto: %v", err)
	}

	card := schema.Flashcard{
		Pergunta:           "O que e um mapa?",
		Resposta:           "Uma estrutura chave-valor.",
		AssuntoID:          assunto.ID,
		DataProximaRevisao: time.Now(),
	}
	if err := db.Create(&card).Error; err != nil {
		t.Fatalf("Create flashcard: %v", err)
	}

	historico := schema.HistoricoRevisoes{
		DataRevisao: time.Now(),
		Desempenho:  "Facil",
		FlashcardID: card.ID,
	}
	if err := db.Create(&historico).Error; err != nil {
		t.Fatalf("Create historico: %v", err)
	}

	if err := DeleteFlashcard(db, card.ID, usuario.ID); err != nil {
		t.Fatalf("DeleteFlashcard: %v", err)
	}

	var deletedCard schema.Flashcard
	if err := db.Unscoped().First(&deletedCard, card.ID).Error; err != nil {
		t.Fatalf("Find deleted flashcard: %v", err)
	}
	if !deletedCard.DeletedAt.Valid {
		t.Fatal("flashcard was not soft deleted")
	}

	var deletedHistorico schema.HistoricoRevisoes
	if err := db.Unscoped().First(&deletedHistorico, historico.ID).Error; err != nil {
		t.Fatalf("Find deleted historico: %v", err)
	}
	if !deletedHistorico.DeletedAt.Valid {
		t.Fatal("historico revisao was not soft deleted")
	}
}

func setupFlashcardTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	if err := db.AutoMigrate(
		&schema.Usuario{},
		&schema.Disciplina{},
		&schema.Assunto{},
		&schema.Flashcard{},
		&schema.HistoricoRevisoes{},
	); err != nil {
		t.Fatalf("AutoMigrate: %v", err)
	}

	return db
}
