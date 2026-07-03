package disciplina

import (
	"context"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"gorm.io/gorm"
)

func BuscarDisciplinasComAssuntos(db *gorm.DB, usuarioID uint) ([]schema.Disciplina, error) {
	var disciplina []schema.Disciplina
	err := db.
		Preload("Assuntos").
		Preload("Assuntos.FlashCards").
		Where("usuario_id = ?", usuarioID).
		Find(&disciplina).Error
	return disciplina, err
}

func SalvarDisciplina(db *gorm.DB, ctx context.Context, disciplina *schema.Disciplina) error {
	if g := db.WithContext(ctx).Create(disciplina); g.Error != nil {
		return g.Error
	}

	return nil
}

func AtualizaDisciplinaEAssuntos(db *gorm.DB, ctx context.Context, usuarioID uint, disciplinaID uint, nome, descricao, cor string, assuntosInput []AssuntoInput) (*schema.Disciplina, []schema.Assunto, error) {
	cleanName, err := ValidarNome(nome)
	if err != nil {
		return nil, nil, err
	}

	var d schema.Disciplina
	if err := db.WithContext(ctx).Where("id = ? AND usuario_id = ?", disciplinaID, usuarioID).First(&d).Error; err != nil {
		return nil, nil, err
	}

	// inicia uma transação
	tx := db.WithContext(ctx).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	d.Nome = cleanName
	d.Descricao = descricao
	d.Cor = cor

	if err := tx.Save(&d).Error; err != nil {
		tx.Rollback()
		return nil, nil, err
	}

	// Busca assuntos
	var assuntosAtuais []schema.Assunto
	if err := tx.Where("disciplina_id = ?", d.ID).Find(&assuntosAtuais).Error; err != nil {
		tx.Rollback()
		return nil, nil, err
	}

	mapaAtuais := make(map[uint]schema.Assunto)
	for _, a := range assuntosAtuais {
		mapaAtuais[a.ID] = a
	}

	idsEnviados := make(map[uint]bool)
	var responseAssuntos []schema.Assunto

	// 5. Atualizar/Inserir assuntos enviados
	for _, aInput := range assuntosInput {
		cleanAssuntoName, err := ValidarNome(aInput.Nome)
		if err != nil {
			continue
		}

		if aInput.ID != "" {
			// Se veio com ID, tenta converter e atualizar
			idParsed, err := strconv.ParseUint(aInput.ID, 10, 32)
			if err == nil {
				idUint := uint(idParsed)

				if assuntoExistente, ok := mapaAtuais[idUint]; ok {
					assuntoExistente.Nome = cleanAssuntoName

					if err := tx.Save(&assuntoExistente).Error; err != nil {
						tx.Rollback()
						return nil, nil, err
					}

					idsEnviados[idUint] = true
					responseAssuntos = append(responseAssuntos, assuntoExistente)
				}
			}
		} else {
			// Sem ID, insere um novo assunto
			novoAssunto := schema.Assunto{
				Nome:         cleanAssuntoName,
				DisciplinaID: d.ID,
			}

			if err := tx.Create(&novoAssunto).Error; err != nil {
				tx.Rollback()
				return nil, nil, err
			}

			responseAssuntos = append(responseAssuntos, novoAssunto)
		}
	}

	// 6. Deletar os assuntos não informados no input
	for _, aAtual := range assuntosAtuais {

		if !idsEnviados[aAtual.ID] {
			if err := tx.Delete(&aAtual).Error; err != nil {
				tx.Rollback()
				return nil, nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	return &d, responseAssuntos, nil
}
