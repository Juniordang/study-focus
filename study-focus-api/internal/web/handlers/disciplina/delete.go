package handlerdisciplina

import (
	"net/http"
	"strconv"

	"github.com/Juniordang/study-focus-api/internal/data/schema"
	"github.com/Juniordang/study-focus-api/internal/web/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Delete(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		id, exists := c.Get("userID")
		if !exists {
			handlers.SendError(c, http.StatusBadRequest, "user not exists")
			return
		}
		usuarioID := id.(uint)

		subjectIDParam := c.Param("id")
		subjectID, err := strconv.ParseUint(subjectIDParam, 10, 32)
		if err != nil {
			handlers.SendError(c, http.StatusBadRequest, "invalid subject ID")
			return
		}

		var disciplina schema.Disciplina
		if err := db.Where("id = ? AND usuario_id = ?", subjectID, usuarioID).First(&disciplina).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				handlers.SendError(c, http.StatusNotFound, "subject not found")
				return
			}
			handlers.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}

		if err := db.Delete(&disciplina).Error; err != nil {
			handlers.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}

		c.Status(http.StatusNoContent)
	}
}
