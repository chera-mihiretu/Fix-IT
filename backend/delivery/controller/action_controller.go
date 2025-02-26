package controller

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/usecases"
	"log"
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

	log.Println("Header", ctx.Request.Header)

	file, header, err := ctx.Request.FormFile("file")
	userID, exist := ctx.Get("user_id")

	if !exist {
		log.Println("User ID does not exist, token problem")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized : invalid Credential"})
		return
	}

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "File not uploaded"})
		return
	}

	defer file.Close()

	filename := infrastructure.GetUniqueFileName()

	link, err := a.actionUsecase.GetPdfLink(ctx, file, header.Filename)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not upload your file"})
		return
	}

	processedText, err := a.actionUsecase.ProcessPDF(ctx, link)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
		return
	}

	questions, conversation, err := a.actionUsecase.UploadForGemini(processedText)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
		return
	}

	questionsID, err := a.actionUsecase.UploadQuestions(ctx, questions, userID.(string))

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
		return
	}

	conversationdID, err := a.actionUsecase.UploadConversation(ctx, conversation)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
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
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
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
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is problem processing your pdf, try again!"})
		return
	}

	ctx.JSON(200, gin.H{
		"section_id": sectionID,
		"message":    "Your pdf is processed successfully",
	})

}

func (a *ActionController) QuizAnswer(ctx *gin.Context) {

	sectionID := ctx.DefaultQuery("section_id", "")
	userID, exist := ctx.Get("user_id")

	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

	if !exist {
		log.Println("User ID does not exist, token problem")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized : invalid Credential"})
		return
	}

	section, err := a.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is Problem loading your data, try again!"})
		return
	}

	var answers domain.AnswerList
	if err := ctx.ShouldBindJSON(&answers); err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please check your input, answer all the questions"})
		return
	}

	score, taken, err := a.actionUsecase.QuizAnswer(ctx, section.QuestionsID, answers.Answers)

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "There is Problem saving your answers"})
		return
	}

	if score != 20 {
		if !taken {
			answerID, err := a.actionUsecase.CreateExplanation(ctx, section.ExplanationsID, answers)
			if err != nil {
				log.Println(err.Error())
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured may be the content of your pdf is too large."})
				return
			}

			section.AnswersID = answerID

			err = a.actionUsecase.UpdateSection(ctx, section)

			if err != nil {
				log.Println(err.Error())
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Problem accessing the database"})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{"score": score, "section_id": sectionID})
			return

		}
		ctx.JSON(http.StatusOK, gin.H{"score": score, "section_id": sectionID, "message": "You have already taken this quiz, There would be no explanation for wrong answers"})
		return

	}

	ctx.JSON(http.StatusOK, gin.H{"score": "Good Job you answer all of it"})

}
