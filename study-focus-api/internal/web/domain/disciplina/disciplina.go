package disciplina

import (
	"errors"
	"regexp"
	"strings"
)

var hexColorRegex = regexp.MustCompile(`^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$`)

func ValidarNome(nome string) (string, error) {
	nome = strings.TrimSpace(nome)

	if nome == "" {
		return "", errors.New("o nome não pode ser vazio")
	}

	if len(nome) > 50 {
		return "", errors.New("o nome deve ter no máximo 50 caracteres")
	}

	return nome, nil
}

// ValidarCor valida e retorna uma cor hex válida.
// Se a cor for inválida ou vazia, retorna a cor padrão #4f46e5.
func ValidarCor(cor string) string {
	cor = strings.TrimSpace(cor)
	if cor == "" || !hexColorRegex.MatchString(cor) {
		return "#4f46e5"
	}
	return cor
}
