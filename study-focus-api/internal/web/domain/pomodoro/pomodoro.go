package pomodoro

import (
	"errors"
	"strings"
)

const (
	FaseFoco       = "foco"
	FasePausaCurta = "pausa_curta"
	FasePausaLonga = "pausa_longa"
)

func NormalizarFase(fase string) string {
	fase = strings.ToLower(strings.TrimSpace(fase))
	if fase == "" {
		return FaseFoco
	}
	return fase
}

func ValidarSessao(duracao int, fase string, sessaoEstudoID *uint) error {
	if duracao <= 0 {
		return errors.New("a duração deve ser maior que zero minutos")
	}

	if fase != FaseFoco && fase != FasePausaCurta && fase != FasePausaLonga {
		return errors.New("fase inválida, use foco, pausa_curta ou pausa_longa")
	}

	return nil
}
