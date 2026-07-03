package handlerchaveapi

type ChaveApiRequest struct {
	Provedor string `json:"provedor" binding:"required"`
	ChaveApi string `json:"chave_api" binding:"required"`
}
