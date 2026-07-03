package ia

import (
	"errors"
	"strings"
)

func ValidateChat(question string) error {
	if len(strings.TrimSpace(question)) < 10 {
		return errors.New("a pergunta deve ter no mínimo 10 caracteres")
	}
	return nil
}
