package flashcard

import "time"

type HistoricoRevisaoDTO struct {
	ID                 uint      `json:"id"`
	DataRevisao        time.Time `json:"data_revisao"`
	Desempenho         string    `json:"desempenho"`
	FlashcardID        uint      `json:"flashcard_id"`
	Pergunta           string    `json:"pergunta"`
	Resposta           string    `json:"resposta"`
	DataProximaRevisao time.Time `json:"data_proxima_revisao"`
	NivelDificuldade   int       `json:"nivel_dificuldade"`
	AssuntoID          uint      `json:"assunto_id"`
	AssuntoNome        string    `json:"assunto_nome"`
	DisciplinaID       uint      `json:"disciplina_id"`
	DisciplinaNome     string    `json:"disciplina_nome"`
}
