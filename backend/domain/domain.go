package domain

import (
	"time"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Age      int    `json:"age"`
	Academic string `json:"academic"`
}

type PDF struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Title    string `json:"title"`
	Filepath string `json:"filepath"`
	Created  string `json:"created"`
}

type Question struct {
	ID        string    `json:"id"`
	PDFID     string    `json:"pdf_id"`
	UserID    string    `json:"user_id"`
	Text      string    `json:"text"`
	Answer    string    `json:"answer,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Section struct {
	ID                string    `json:"id"`
	PDFID             string    `json:"pdf_id"`
	Title             string    `json:"title"`
	Content           string    `json:"content"`
	SimplifiedVersion []string  `json:"simplified_version"`
	CreatedAt         time.Time `json:"created_at"`
}

type Verification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}
