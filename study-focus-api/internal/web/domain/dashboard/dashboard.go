package dashboard

import (
	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/domain/pomodoro"
	"gorm.io/gorm"
)

type DashboardDTO struct {
	TotalHorasEstudo     float64          `json:"total_horas_estudo"`
	TotalFlashcards      int64            `json:"total_flashcards"`
	SessoesPorDisciplina map[string]int   `json:"sessoes_por_disciplina"` // Nome da matéria: Minutos
	CardsPorDificuldade  map[string]int64 `json:"cards_por_dificuldade"`
}

func CalcularEstatisticas(db *gorm.DB, usuarioID uint) (*DashboardDTO, error) {
	var stats DashboardDTO
	stats.SessoesPorDisciplina = make(map[string]int)
	stats.CardsPorDificuldade = make(map[string]int64)

	// Soma total de minutos e converte para horas
	var totalMinutos int64
	db.Model(&schema.Pomodoro{}).
		Joins("JOIN sessao_estudos ON sessao_estudos.id = pomodoros.sessao_estudo_id").
		Where("sessao_estudos.usuario_id = ?", usuarioID).
		Where("pomodoros.fase = ?", pomodoro.FaseFoco).
		Select("COALESCE(SUM(pomodoros.duracao_minutos), 0)").
		Row().Scan(&totalMinutos)

	stats.TotalHorasEstudo = float64(totalMinutos) / 60.0

	// Total de Flashcards do usuário
	db.Model(&schema.Flashcard{}).
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("disciplinas.usuario_id = ?", usuarioID).
		Count(&stats.TotalFlashcards)

	//  Minutos estudados por Disciplina
	rows, err := db.Table("pomodoros").
		Select("disciplinas.nome, SUM(pomodoros.duracao_minutos)").
		Joins("JOIN sessao_estudos ON sessao_estudos.id = pomodoros.sessao_estudo_id").
		Joins("JOIN assuntos ON assuntos.id = sessao_estudos.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("sessao_estudos.usuario_id = ?", usuarioID).
		Where("pomodoros.fase = ?", pomodoro.FaseFoco).
		Group("disciplinas.nome").Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var nome string
		var minutos int
		rows.Scan(&nome, &minutos)
		stats.SessoesPorDisciplina[nome] = minutos
	}

	type dificuldadeRow struct {
		Nivel int
		Total int64
	}

	var dificuldades []dificuldadeRow
	db.Model(&schema.Flashcard{}).
		Select("flashcards.nivel_dificuldade AS nivel, COUNT(*) AS total").
		Joins("JOIN assuntos ON assuntos.id = flashcards.assunto_id").
		Joins("JOIN disciplinas ON disciplinas.id = assuntos.disciplina_id").
		Where("disciplinas.usuario_id = ?", usuarioID).
		Group("flashcards.nivel_dificuldade").
		Scan(&dificuldades)

	labels := map[int]string{
		1: "Fácil",
		2: "Médio",
		3: "Difícil",
	}

	for _, dificuldade := range dificuldades {
		label, ok := labels[dificuldade.Nivel]
		if !ok {
			label = "Não classificado"
		}
		stats.CardsPorDificuldade[label] = dificuldade.Total
	}

	return &stats, nil
}
