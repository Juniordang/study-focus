package ia

import (
	"encoding/json"
	"regexp"
	"strings"
)

var (
	flashcardsMarkerRegex = regexp.MustCompile(`(?im)^#{1,6}\s*\[?\s*flashcards\s*\]?\s*$`)
	jsonCodeBlockRegex    = regexp.MustCompile("(?is)```(?:json)?\\s*(.*?)\\s*```")
)

func FormatResponseIA(rawResponse string) (string, []Card) {
	textoMarkdown := strings.TrimSpace(rawResponse)
	jsonBruto := ""

	if marker := flashcardsMarkerRegex.FindStringIndex(rawResponse); marker != nil {
		textoMarkdown = strings.TrimSpace(rawResponse[:marker[0]])
		jsonBruto = extractFlashcardsJSON(rawResponse[marker[1]:])
	}

	var cards []Card
	if jsonBruto != "" {
		_ = json.Unmarshal([]byte(jsonBruto), &cards)
	}

	if cards == nil {
		cards = []Card{}
	}

	return textoMarkdown, cards
}

func extractFlashcardsJSON(raw string) string {
	jsonBruto := strings.TrimSpace(raw)
	if jsonBruto == "" {
		return ""
	}

	if match := jsonCodeBlockRegex.FindStringSubmatch(jsonBruto); len(match) > 1 {
		jsonBruto = strings.TrimSpace(match[1])
	}

	start := strings.Index(jsonBruto, "[")
	end := strings.LastIndex(jsonBruto, "]")
	if start == -1 || end == -1 || end < start {
		return ""
	}

	return strings.TrimSpace(jsonBruto[start : end+1])
}
