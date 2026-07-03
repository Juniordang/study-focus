package handlerdisciplina

import "github.com/Juniordang/study-focus-api/internal/data/schema"

type Assunto struct {
	ID     string `json:"id"`
	Nome   string `json:"nome"`
	Status string `json:"status"`
}

type DisciplinaRequest struct {
	Nome      string    `json:"name" binding:"required,max=50"`
	Descricao string    `json:"description"`
	Cor       string    `json:"color"`
	Assuntos  []Assunto `json:"assuntos"`
}

type DisciplinaResponse struct {
	schema.Disciplina
	Assuntos []schema.Assunto
}
