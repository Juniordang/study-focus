package handleragenda

type AgendaRequest struct {
	Titulo     string `json:"titulo" binding:"required"`
	Descricao  string `json:"descricao"`
	Data       string `json:"data" binding:"required"` // ISO 8601
	Prioridade string `json:"prioridade"`
	AssuntoID  uint   `json:"assunto_id"`
}
