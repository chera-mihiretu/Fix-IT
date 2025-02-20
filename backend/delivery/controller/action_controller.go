package controller

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/usecases"
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
	userID, exist := ctx.Get("user_id")

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

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	processedText, err := a.actionUsecase.ProcessPDF(ctx, link)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	questions, conversation, err := a.actionUsecase.UploadForGemini(processedText)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	questionsID, err := a.actionUsecase.UploadQuestions(ctx, questions, userID)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	conversationdID, err := a.actionUsecase.UploadConversation(ctx, conversation)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	oldfilename := header.Filename

	pdf := domain.PDF{
		Title:   oldfilename,
		DropBox: filename,
		Created: time.Now().Format(time.RFC3339),
	}

	pdfId, err := a.actionUsecase.UploadPDF(ctx, pdf)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	section := domain.Section{
		SectionName:    oldfilename,
		PDFID:          pdfId,
		QuestionsID:    questionsID,
		ExplanationsID: conversationdID,
		CreatedBy:      userID.(string),
	}

	err = a.actionUsecase.UploadSection(ctx, section)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"questions": questions})

}

func (a *ActionController) QuizAnswer(ctx *gin.Context) {

	quizID := ctx.Param("id")
	userID := ctx.Get("user_id")

	var answers []domain.Answer

	if err := ctx.ShouldBindJSON(&answers); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	score, err := a.actionUsecase.QuizAnswer(ctx, quizID, userID, answers)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if score != 20 {

	}

	ctx.JSON(http.StatusOK, gin.H{"score": "Good Job you answer all of it"})

}
