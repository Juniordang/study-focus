package usuario

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

func GenerateHash(password string) (*string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("hashed password failed")
	}

	passwordStr := string(hashedPassword)

	return &passwordStr, nil
}

func VerificarSenha(senhaHash, senha string) error {
	return bcrypt.CompareHashAndPassword([]byte(senhaHash), []byte(senha))
}

func ValidarConfiguracoes(timeFocus, timePause, timeLongPause int) error {
	if timeFocus < 1 || timeFocus > 120 {
		return errors.New("The focus time is not between 1 and 120 minutes")
	}

	if timePause > timeFocus || timeLongPause > timeFocus {
		return errors.New("The pause time cannot be longer than the focus time")
	}

	return nil
}
