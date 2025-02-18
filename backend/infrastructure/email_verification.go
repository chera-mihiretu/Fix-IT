package infrastructure

import (
	"errors"
	"fmt"
	"net/smtp"
	"os"
)

func SendEmail(to, token string) error {

	from := os.Getenv("EMAIL")
	email_password := os.Getenv("EMAIL_PASSWORD")

	subject := "Email Verification"

	body := fmt.Sprintf("Click on the following link to verify your account: http://localhost:8080/u/verify?token=%s", token)

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	message := []byte("Subject: " + subject + "\r\n\r\n" + body)

	auth := smtp.PlainAuth("", from, email_password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message)
	if err != nil {
		return errors.New("infrastructure/email_verification.go: " + err.Error())
	}

	return nil
}
