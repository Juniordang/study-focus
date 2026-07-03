package ia

import "github.com/Juniordang/study-focus-api/internal/data/schema"

func MakeProviders(configs []schema.ChaveIA) AIService {
	var providers AIService

	for _, cfg := range configs {
		switch cfg.Provedor {
		case "gemini":
			{
				if cfg.ChaveApi != "" {
					providers.Providers = append(providers.Providers, &GeminiProvider{ApiKey: cfg.ChaveApi})
				}
			}
		case "groq":
			{
				if cfg.ChaveApi != "" {
					providers.Providers = append(providers.Providers, &GroqProvider{ApiKey: cfg.ChaveApi})
				}
			}
		}
	}

	return providers

}
