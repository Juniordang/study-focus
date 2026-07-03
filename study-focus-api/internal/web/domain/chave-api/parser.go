package chaveapi

func MaskAPIKey(key string) string {
	if len(key) <= 8 {
		return "********"
	}

	return key[:4] + "..." + key[len(key)-4:]
}
