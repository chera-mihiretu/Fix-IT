package infrastructure

import (
	"fmt"
	"github/chera/fix-it/domain"
	"strconv"
	"strings"
)

func ParseQuestions(input string) []domain.Question {
	lines := strings.Split(input, "\n")
	var questions []domain.Question
	var q domain.Question
	for i := 0; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}

		if strings.Contains(line, ",") {

			last := 0
			for j := 0; j < len(line); j++ {

				if line[j] == ',' {
					last = j
					break
				}

			}

			pref := line[:last]

			if pref != "A" && pref != "B" && pref != "C" && pref != "D" {
				q.Question = line[last+2:]

			} else if pref == "A" {
				q.A = strings.TrimSpace(strings.TrimPrefix(line, "A,"))
			} else if pref == "B" {
				q.B = strings.TrimSpace(strings.TrimPrefix(line, "B,"))
			} else if pref == "C" {
				q.C = strings.TrimSpace(strings.TrimPrefix(line, "C,"))
			} else if pref == "D" {
				q.D = strings.TrimSpace(strings.TrimPrefix(line, "D,"))
			}
		} else {
			// Last non-empty line should be the correct answer
			q.Answer = line
			questions = append(questions, q)
		}
	}
	return questions
}

func ParseGeminiAnswer(response string) []domain.QeustionAnswer {
	questionBlocks := strings.Split(response, "\n")

	var questions []domain.QeustionAnswer
	var q domain.QeustionAnswer

	for _, line := range questionBlocks {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var left, right string
		for i := 0; i < len(line); i++ {
			if line[i] == ':' {
				left = strings.TrimSpace(line[:i])
				right = strings.TrimSpace(line[i+1:])
			}
		}

		if strings.Contains(left, "Question Number") {
			if q.QuestionNumber != 0 {
				questions = append(questions, q)
				q = domain.QeustionAnswer{}
			}
			q.QuestionNumber, _ = strconv.Atoi(strings.TrimSpace(right))
		}
		if strings.Contains(left, "Correct Answer") {
			q.CorrectAnswer = strings.TrimSpace(right)
		}
		if strings.Contains(left, "Your Answer") {
			q.YourAnswer = strings.TrimSpace(right)
		}
		if strings.Contains(left, "Correctness") {
			q.Correctness = strings.TrimSpace(right) == "Correct"
		}
		if strings.Contains(left, "Explanation") {
			q.Explanation = strings.TrimSpace(right)

		}

	}

	if q.QuestionNumber != 0 {
		questions = append(questions, q)
	}
	return questions

}

func ParseAnswer(answers []domain.Answer) string {
	result := ""
	for _, ans := range answers {

		result += fmt.Sprintf("QuestionNumber : %d, Answer :%s\n", ans.QuestionNO, ans.Answer)

	}

	return result
}
