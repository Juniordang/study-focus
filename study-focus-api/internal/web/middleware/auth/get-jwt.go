package auth

import (
	"log"
	"os"
)

func GetJWTKey() []byte {
	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		log.Println("AVISO: JWT_SECRET não encontrada nas variáveis de ambiente. Usando chave padrão fraca.")
		return []byte("chave_padrao_de_desenvolvimento")
	}

	return []byte(secret)
}
