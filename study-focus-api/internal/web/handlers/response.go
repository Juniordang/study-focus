package handlers

import "github.com/gin-gonic/gin"

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

func SendSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, Response{
		Success: true,
		Data:    data,
	})
}

func SendError(c *gin.Context, statusCode int, msg string) {
	c.JSON(statusCode, Response{
		Success: false,
		Message: msg,
	})
}
