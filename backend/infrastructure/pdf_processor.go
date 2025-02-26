package infrastructure

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func UploadPDF(file multipart.File, filename string) (string, error) {
	apiKey, exist := os.LookupEnv("PDFCO_API_KEY")
	baseURL := "https://api.pdf.co/v1"

	if !exist {
		return "", errors.New("PDFCO_API_KEY not found")
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("error creating form file: %w", err)
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return "", fmt.Errorf("error copying file: %w", err)
	}

	err = writer.Close()
	if err != nil {
		return "", fmt.Errorf("error closing writer: %w", err)
	}

	req, err := http.NewRequest("POST", baseURL+"/file/upload", body)
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		responseBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("PDF.co API returned status %d: %s", resp.StatusCode, string(responseBody))
	}

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response body: %w", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(responseBody, &result)
	if err != nil {
		return "", fmt.Errorf("error unmarshalling response: %w", err)
	}

	if result["error"] == true {
		return "", fmt.Errorf("error from PDF.co: %v", result["message"])
	}

	fileURL := result["url"].(string)
	return fileURL, nil

}

func ProcessPDF(link string) (string, error) {

	apiKey, exist := os.LookupEnv("PDFCO_API_KEY")

	if !exist {
		return "", errors.New("PDFCO_API_KEY not found")
	}

	the_text, err := ExtractText(link, apiKey)

	if err != nil {
		return "", err
	}
	return the_text, nil

}

func ExtractText(fileId string, apiKey string) (string, error) {
	const pdfCoConvertToTextURL = "https://api.pdf.co/v1/pdf/convert/to/text"

	requestBody, _ := json.Marshal(map[string]string{"url": fileId})
	req, err := http.NewRequest("POST", pdfCoConvertToTextURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("PDF.co API returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response body: %w", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", fmt.Errorf("error unmarshalling response: %w", err)
	}

	if result["error"] == true {
		return "", fmt.Errorf("error from PDF.co: %v", result["message"])
	}

	text_link := result["url"].(string)
	return text_link, nil
}
