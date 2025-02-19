package controller

import (
	"fix-it/domain"
	"fix-it/infrastructure"
	"fix-it/usecases"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type ActionController struct {
	actionUsecase usecases.ActionUsecase
}

func NewActionController(actionusecase usecases.ActionUsecase) *ActionController {

	return &ActionController{
		actionUsecase: actionusecase,
	}

}

func (a *ActionController) UploadPDF(ctx *gin.Context) {

	file, header, err := ctx.Request.FormFile("file")
	username, exist := ctx.Get("username")

	if !exist {
		ctx.JSON(400, gin.H{"error": "No username found"})
		return
	}

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	defer file.Close()

	filename := infrastructure.GetUniqueFileName()
	drop_token, exist := os.LookupEnv("DROPBOX_TOKEN")
	if !exist {
		ctx.JSON(400, gin.H{"error": "No dropbox token found"})
		return
	}

	err = a.actionUsecase.UploadToDropBox(ctx, file, filename, drop_token)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	link, err := a.actionUsecase.GetDropLink(ctx, filename)

	processedText, err := a.actionUsecase.ProcessPDF(ctx, link)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	ctx.JSON(200, gin.H{"processed_text": processedText})

	return

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	oldfilename := header.Filename

	pdf := domain.PDF{
		Title:   oldfilename,
		DropBox: filename,
		Created: time.Now().Format(time.RFC3339),
	}

	err = a.actionUsecase.UploadPDF(ctx, pdf, username.(string))

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "pdf uploaded"})

}
