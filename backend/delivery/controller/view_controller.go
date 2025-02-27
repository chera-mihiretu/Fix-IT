package controller

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"github/chera/fix-it/usecases"
	"log"
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
	sectionID := ctx.DefaultQuery("section_id", "")
	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

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
	sectionID := ctx.DefaultQuery("section_id", "")
	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

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

	sectionID := ctx.DefaultQuery("section_id", "")

	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

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
	sectionID := ctx.DefaultQuery("section_id", "")
	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

	userID, exist := ctx.Get("user_id")

	if !exist {
		log.Println("No user id found")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Un authorized acess"})
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

func (v *ViewController) SectionList(ctx *gin.Context) {
	userID, exist := ctx.Get("user_id")
	if !exist {
		log.Println("User ID does not exist, token problem")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized : invalid Credential"})
		return
	}

	sections, err := v.viewusecase.SectionList(ctx, userID.(string))

	if err != nil {
		log.Println(err.Error())

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "There is problem fetching your data",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"sections": sections,
	})

}

func (v *ViewController) SectionDetail(ctx *gin.Context) {
	sectionID := ctx.DefaultQuery("section_id", "")
	if sectionID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Section id is required",
		})
		return
	}

	userID, exist := ctx.Get("user_id")

	if !exist {
		if !exist {
			log.Println("User ID does not exist, token problem")
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized : invalid Credential"})
			return
		}
	}

	section, err := v.viewusecase.GetSection(ctx, sectionID, userID.(string))

	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "There is problem fetching your data, try again !",
		})
		return
	}

	if section.AnswersID == "" {
		ctx.JSON(http.StatusOK, gin.H{
			"topics": domain.TopicList{},
			"error":  "Please answer the quiz first for your topics to be generated",
		})
		return
	}

	topics, err := v.viewusecase.GetTopic(ctx, section.ExplanationsID)

	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "There is problem Loading your data",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"topics": topics,
	})

}
