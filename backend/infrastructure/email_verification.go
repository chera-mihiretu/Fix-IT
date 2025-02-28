package infrastructure

import (
	"errors"
	"fmt"
	"os"

	"gopkg.in/gomail.v2"
)

func SendEmail(to, token string) error {

	from := os.Getenv("EMAIL")
	email_password := os.Getenv("EMAIL_PASSWORD")
	base_url := os.Getenv("BASE_URL")

	subject := "Email Verification"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix It - Email Verification</title>
    <style>
        /* Global Styles */
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to right, #6a11cb, #2575fc);
            color: white;
            text-align: center;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 20px;
        }

        /* Header */
        h1 {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(to right, #b24592, #f15f79);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        /* Description */
        p {
            font-size: 1.2rem;
            max-width: 500px;
            margin-bottom: 20px;
            opacity: 0.9;
        }

        /* Button */
        .verify-btn {
            background: #ffffff;
            color: #6a11cb;
            font-size: 1.2rem;
            font-weight: bold;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.3s ease-in-out;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            text-decoration: none;
            display: inline-block;
        }

        .verify-btn:hover {
            background: #f15f79;
            color: white;
            transform: scale(1.05);
        }
    </style>
</head>
<body>

    <h1>Fix It</h1>
    <p>To keep your account secure and enable full access to Fix It, please verify your email address. This helps us confirm your identity and protect your data.</p>
    <a href=" %s/u/verify?token=%s" class="verify-btn">Verify Your Account</a>

</body>
</html>

`, base_url, token)

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer("smtp.gmail.com", 587, from, email_password)

	if err := d.DialAndSend(m); err != nil {
		return errors.New("infrastructure/email_verification.go: " + err.Error())
	}

	return nil
}
