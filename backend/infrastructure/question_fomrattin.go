package infrastructure

import (
	"github/chera/fix-it/domain"
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
