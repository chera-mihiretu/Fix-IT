package controller

import (
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/usecases"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ViewController struct {
	viewusecase    usecases.ViewUsecase
	actionsusecase usecases.ActionUsecase
}

func NewViewController(viewusecase usecases.ViewUsecase, actionusecase usecases.ActionUsecase) *ViewController {
	return &ViewController{
		viewusecase:    viewusecase,
		actionsusecase: actionusecase,
	}
}

func (v *ViewController) ViewExplanation(ctx *gin.Context) {
	sectionID := ctx.DefaultQuery("id", "")

	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No user found"})
		return
	}
	section, err := v.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	explanation, err := v.viewusecase.GetExplanation(ctx, section.ExplanationsID)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(explanation.Turns) == 1 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No explanation found"})
		return
	}

	ctx.JSON(http.StatusOK, infrastructure.ParseGeminiAnswer(explanation.Turns[1].Gemini))
}

func (v *ViewController) ViewQuiz(ctx *gin.Context) {
	sectionID := ctx.DefaultQuery("id", "")

	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No user found"})
		return
	}

	section, err := v.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	quiz, err := v.viewusecase.GetQuiz(ctx, section.QuestionsID)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"quiz": quiz,
	})
}

func (v *ViewController) CreateTopic(ctx *gin.Context) {

	sectionID := ctx.DefaultQuery("id", "")

	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No user found"})
		return
	}

	section, err := v.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err = v.actionsusecase.CreateTopic(ctx, section.AnswersID, section.ExplanationsID)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"topic": sectionID,
	})
}

func (v *ViewController) ViewTopics(ctx *gin.Context) {
	sectionID := ctx.DefaultQuery("id", "")

	userID, exist := ctx.Get("user_id")

	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No user found"})
		return
	}

	section, err := v.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	topic, err := v.viewusecase.GetTopic(ctx, section.ExplanationsID)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"section": topic,
	})
}
