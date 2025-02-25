package controller

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/usecases"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ActionController struct {
	actionUsecase usecases.ActionUsecase
	viewusecase   usecases.ViewUsecase
}

func NewActionController(actionusecase usecases.ActionUsecase, viewusecase usecases.ViewUsecase) *ActionController {

	return &ActionController{
		actionUsecase: actionusecase,
		viewusecase:   viewusecase,
	}

}

func (a *ActionController) UploadPDF(ctx *gin.Context) {

	file, header, err := ctx.Request.FormFile("file")
	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(400, gin.H{"error": "No userid found"})
		return
	}

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	defer file.Close()

	filename := infrastructure.GetUniqueFileName()

	if !exist {
		ctx.JSON(400, gin.H{"error": "No dropbox token found"})
		return
	}

	link, err := a.actionUsecase.GetPdfLink(ctx, file, header.Filename)

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

	questionsID, err := a.actionUsecase.UploadQuestions(ctx, questions, userID.(string))

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

	sectionID, err := a.actionUsecase.UploadSection(ctx, section)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"questions": sectionID})

}

func (a *ActionController) QuizAnswer(ctx *gin.Context) {

	sectionID := ctx.DefaultQuery("id", "")
	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "User ID not found"})
		return
	}

	section, err := a.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var answers domain.AnswerList
	if err := ctx.ShouldBindJSON(&answers); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	score, taken, err := a.actionUsecase.QuizAnswer(ctx, section.QuestionsID, answers.Answers)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if score != 20 {
		if !taken {
			answerID, err := a.actionUsecase.CreateExplanation(ctx, section.ExplanationsID, answers)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			section.AnswersID = answerID

			err = a.actionUsecase.UpdateSection(ctx, section)

			if err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

		}
		ctx.JSON(http.StatusOK, gin.H{"score": score, "explanation_id": sectionID})
		return

	}

	ctx.JSON(http.StatusOK, gin.H{"score": "Good Job you answer all of it"})

}
