package flashcard

import (
	"errors"
	"time"
)

func CalcularProximaRevisao(nivel int) (time.Time, error) {
	now := time.Now()

	switch nivel {
	// facil
	case 1:
		return now.AddDate(0, 0, 5), nil
	case 2: //medio
		return now.AddDate(0, 0, 2), nil
	case 3: //dificil
		return now.AddDate(0, 0, 1), nil
	default:
		return time.Time{}, errors.New("level invalid: use facil, medio ou dificil")
	}
}
