package controller

import (
	"fix-it/domain"
	"fix-it/infrastructure"
	"fix-it/usecases"
	"io"
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

	drop_box_url := "https://content.dropboxapi.com/2/files/upload"

	req, err := http.NewRequest("POST", drop_box_url, file)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	drop_token, exist := os.LookupEnv("DROPBOX_TOKEN")

	if !exist {
		ctx.JSON(400, gin.H{"error": "No dropbox token found"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+drop_token)
	req.Header.Set("Content-Type", "application/octet-stream")
	req.Header.Set("Dropbox-API-Arg", "{\"path\": \"/"+filename+"\"}")

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if resp.StatusCode != http.StatusOK {
		ctx.JSON(400, gin.H{"error": string(body)})
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
