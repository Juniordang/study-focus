package config

func GetLogger(p string) *Logger {
	logger := Newlogger(p)
	return logger
}
