package schema

import (
	"time"

	"gorm.io/gorm"
)

type Usuario struct {
	gorm.Model
	Nome                  string         `gorm:"column:nome;not null" json:"nome"`
	Email                 string         `gorm:"column:email;unique;not null" json:"email"`
	Senha                 string         `gorm:"column:senha;not null" json:"senha"`
	TempoFocoPadrao       int            `gorm:"column:tempo_foco_padrao;default:25" json:"tempo_foco_padrao"`
	TempoDescansoPadrao   int            `gorm:"column:tempo_descanso_padrao;default:5" json:"tempo_descanso_padrao"`
	TempoPausaLongaPadrao int            `gorm:"column:tempo_pausa_longa_padrao;default:15" json:"tempo_pausa_longa_padrao"`
	Disciplinas           []Disciplina   `gorm:"constraint:OnDelete:CASCADE;" json:"disciplinas,omitempty"`
	EventosAgenda         []SessaoEstudo `gorm:"constraint:OnDelete:CASCADE;" json:"eventos_agenda,omitempty"`
	ConfiguracoesIA       []ChaveIA      `gorm:"constraint:OnDelete:CASCADE;" json:"configuracoes_ia,omitempty"`
	HistoricoIA           []HistoricoIA  `gorm:"constraint;OnDelete:SET NULL;" json:"historico_id,omitempty"`
}

type ChaveIA struct {
	gorm.Model
	ChaveApi  string `gorm:"column:chave_api" json:"-"`
	Provedor  string `gorm:"column:provedor" json:"provedor"` // Ex: "gemini", "groq"
	UsuarioID uint   `gorm:"column:usuario_id;not null" json:"usuario_id"`
}

type Disciplina struct {
	gorm.Model
	Nome        string        `gorm:"column:nome;not null" json:"nome"`
	Descricao   string        `gorm:"column:descricao" json:"descricao"`
	Cor         string        `gorm:"column:cor" json:"cor"`
	UsuarioID   uint          `gorm:"column:usuario_id;not null" json:"usuario_id"`
	Assuntos    []Assunto     `gorm:"constraint;OnDelete:SET NULL;" json:"assuntos,omitempty"`
	HistoricoIA []HistoricoIA `gorm:"constraint;OnDelete:SET NULL;" json:"historico_id,omitempty"`
}

type Assunto struct {
	gorm.Model
	Nome          string         `gorm:"column:nome;not null" json:"nome"`
	DisciplinaID  uint           `gorm:"column:disciplina_id;not null" json:"disciplina_id"`
	EventosAgenda []SessaoEstudo `gorm:"constraint:OnDelete:SET NULL;" json:"eventos_agenda,omitempty"`
	FlashCards    []Flashcard    `gorm:"constraint:OnDelete:CASCADE;" json:"flashcards,omitempty"`
}

type Flashcard struct {
	gorm.Model
	Pergunta           string              `gorm:"column:pergunta;not null" json:"pergunta"`
	Resposta           string              `gorm:"column:resposta;not null" json:"resposta"`
	NivelDificuldade   int                 `gorm:"column:nivel_dificuldade" json:"nivel_dificuldade"`
	DataProximaRevisao time.Time           `gorm:"column:data_proxima_revisao" json:"data_proxima_revisao"`
	AssuntoID          uint                `gorm:"column:assunto_id;not null" json:"assunto_id"`
	HistoricosRevisao  []HistoricoRevisoes `gorm:"constraint:OnDelete:CASCADE;" json:"historicos_revisao,omitempty"`
}

type Pomodoro struct {
	gorm.Model
	DataExecucao     time.Time `gorm:"column:data_execucao" json:"data_execucao"`
	Fase             string    `gorm:"column:fase;not null;default:foco" json:"fase"`
	DuracaoMinutos   int       `gorm:"column:duracao_minutos;not null" json:"duracao_minutos"`
	CiclosConcluidos int       `gorm:"column:ciclos_concluidos;default:0" json:"ciclos_concluidos"`
	SessaoEstudoID   *uint     `gorm:"column:sessao_estudo_id" json:"sessao_estudo_id,omitempty"`
}

type HistoricoRevisoes struct {
	gorm.Model
	DataRevisao time.Time `gorm:"column:data_revisao" json:"data_revisao"`
	Desempenho  string    `gorm:"column:desempenho" json:"desempenho"` // Ex: "Facil", "Medio", "Dificil"
	FlashcardID uint      `gorm:"column:flashcard_id;not null" json:"flashcard_id"`
}

type SessaoEstudo struct {
	gorm.Model
	Titulo     string     `gorm:"column:titulo;not null" json:"titulo"`
	Descricao  string     `gorm:"column:descricao" json:"descricao"`
	Data       time.Time  `gorm:"column:data;not null" json:"data"`
	Prioridade string     `gorm:"column:prioridade" json:"prioridade"`
	UsuarioID  uint       `gorm:"column:usuario_id;not null" json:"usuario_id"`
	AssuntoID  uint       `gorm:"column:assunto_id" json:"assunto_id"`
	Pomodoros  []Pomodoro `gorm:"constraint:OnDelete:CASCADE;" json:"sessoes_estudo,omitempty"`
}

type HistoricoIA struct {
	gorm.Model
	Pergunta string `gorm:"column:pergunta;not null" json:"pergunta"`
	Resposta string `gorm:"column:resposta;not null" json:"resposta"`
	// Se for zero/nulo, é uma pergunta avulsa (Geral)
	DisciplinaID *uint `gorm:"column:disciplina_id" json:"disciplina_id"`
	AssuntoID    *uint `gorm:"column:assunto_id" json:"assunto_id"`
	UsuarioID    uint  `gorm:"column:usuario_id;not null" json:"usuario_id"`
}

func (d *Disciplina) BeforeDelete(tx *gorm.DB) error {
	assuntoIDs := tx.Model(&Assunto{}).Select("id").Where("disciplina_id = ?", d.ID)
	flashcardIDs := tx.Model(&Flashcard{}).Select("id").Where("assunto_id IN (?)", assuntoIDs)
	sessaoEstudoIDs := tx.Model(&SessaoEstudo{}).Select("id").Where("assunto_id IN (?)", assuntoIDs)

	if err := tx.Where("flashcard_id IN (?)", flashcardIDs).Delete(&HistoricoRevisoes{}).Error; err != nil {
		return err
	}

	if err := tx.Where("sessao_estudo_id IN (?)", sessaoEstudoIDs).Delete(&Pomodoro{}).Error; err != nil {
		return err
	}

	if err := tx.Where("assunto_id IN (?)", assuntoIDs).Delete(&Flashcard{}).Error; err != nil {
		return err
	}

	if err := tx.Where("assunto_id IN (?)", assuntoIDs).Delete(&SessaoEstudo{}).Error; err != nil {
		return err
	}

	if err := tx.Where("disciplina_id = ? OR assunto_id IN (?)", d.ID, assuntoIDs).Delete(&HistoricoIA{}).Error; err != nil {
		return err
	}

	if err := tx.Where("disciplina_id = ?", d.ID).Delete(&Assunto{}).Error; err != nil {
		return err
	}

	return nil
}

func (a *Assunto) BeforeDelete(tx *gorm.DB) error {
	flashcardIDs := tx.Model(&Flashcard{}).Select("id").Where("assunto_id = ?", a.ID)
	sessaoEstudoIDs := tx.Model(&SessaoEstudo{}).Select("id").Where("assunto_id = ?", a.ID)

	if err := tx.Where("flashcard_id IN (?)", flashcardIDs).Delete(&HistoricoRevisoes{}).Error; err != nil {
		return err
	}

	if err := tx.Where("sessao_estudo_id IN (?)", sessaoEstudoIDs).Delete(&Pomodoro{}).Error; err != nil {
		return err
	}

	if err := tx.Where("assunto_id = ?", a.ID).Delete(&Flashcard{}).Error; err != nil {
		return err
	}

	if err := tx.Where("assunto_id = ?", a.ID).Delete(&SessaoEstudo{}).Error; err != nil {
		return err
	}

	if err := tx.Where("assunto_id = ?", a.ID).Delete(&HistoricoIA{}).Error; err != nil {
		return err
	}

	return nil
}

func (f *Flashcard) BeforeDelete(tx *gorm.DB) error {
	return tx.Where("flashcard_id = ?", f.ID).Delete(&HistoricoRevisoes{}).Error
}

func (s *SessaoEstudo) BeforeDelete(tx *gorm.DB) error {
	return tx.Where("sessao_estudo_id = ?", s.ID).Delete(&Pomodoro{}).Error
}
