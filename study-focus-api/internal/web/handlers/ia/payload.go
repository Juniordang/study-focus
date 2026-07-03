package handleria

type ChatRequest struct {
	Pergunta string `json:"pergunta" binding:"required"`
}

type ChatResponse struct {
	Resposta string `json:"resposta"`
}
