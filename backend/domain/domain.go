package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
	Password string             `bson:"password" json:"password"`
	Email    string             `bson:"email" json:"email"`
	Age      int                `bson:"age" json:"age"`
	Academic string             `bson:"academic" json:"academic"`
}

type PDF struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Title   string             `bson:"title"`
	DropBox string             `bson:"dropbox"`
	Created string             `bson:"created"`
}

type Section struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	SectionName    string             `bson:"section_name"`
	PDFID          string             `bson:"pdf_id"`
	QuestionsID    string             `bson:"questions_id"`
	ExplanationsID string             `bson:"explanations_id"`
	CreatedBy      string             `bson:"created_by"`
}

type Verification struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    string             `bson:"user_id"`
	Token     string             `bson:"token"`
	ExpiresAt time.Time          `bson:"expires_at"`
}

type ConversationTurn struct {
	User   string `bson:"user"`
	Gemini string `bson:"gemini"`
}

type Conversation struct {
	ID    primitive.ObjectID `bson:"_id,omitempty"`
	Turns []ConversationTurn `bson:"conversation"`
}

type Question struct {
	Question string `bson:"question"`
	A        string `bson:"a"`
	B        string `bson:"b"`
	C        string `bson:"c"`
	D        string `bson:"d"`
	Answer   string `bson:"answer"`
}

type Quiz struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Questions []Question         `bson:"questions"`
	CreatedBy string             `bson:"created_by"`
}

type Answer struct {
	QuestionNO int    `json:"question_no" bson:"question_no"`
	Answer     string `json:"answer" bson:"answer"`
}
