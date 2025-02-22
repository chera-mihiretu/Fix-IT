package test

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"testing"
)

func TestParseQuestions(t *testing.T) {
	// Test input
	input := `1, Who is Abdi?
A, A peer coach
B, A friend of the author
C, A stranger the author interviewed for a class
D, An experienced coach hired by the author
A

`

	// Call the function under test
	result := infrastructure.ParseQuestions(input)

	// Define the expected result (this will depend on your implementation)
	expected := []domain.Question{
		{Question: "Who is Abdi?", A: "A peer coach", B: "A friend of the author", C: "A stranger the author interviewed for a class", D: "An experienced coach hired by the author", Answer: "A"},
		// Continue with all expected question-answer pairs
	}

	// Compare the result with the expected
	if len(result) != len(expected) {
		t.Fatalf("Expected %d questions, got %d", len(expected), len(result))
	}

	for i, question := range result {
		if question != expected[i] {
			t.Errorf("At index %d, expected %v, got %v", i, expected[i], question)
		}
	}
}

func TestParseGeminiAnswer(t *testing.T) {
	// Test input
	input := `
	Question Number: 1
	Correct Answer: B
	Your Answer: A
	Correctness: Incorrect
	Explanation: The primary cause of the agricultural crisis in Africa is the reliance on outdated farming practices, not the exodus of the rural population to urban areas.
	
	Question Number: 2
	Correct Answer: D
	Your Answer: B
	Correctness: Incorrect
	Explanation: The indirect impact of the agricultural problem in Africa includes all of the options provided, not just reduced food security.



	
	`

	result := infrastructure.ParseGeminiAnswer(input)

	expected := []domain.QeustionAnswer{
		{QuestionNumber: 1, CorrectAnswer: "B", YourAnswer: "A", Explanation: "The primary cause of the agricultural crisis in Africa is the reliance on outdated farming practices, not the exodus of the rural population to urban areas.", Correctness: false},
		{QuestionNumber: 2, CorrectAnswer: "D", YourAnswer: "B", Explanation: "The indirect impact of the agricultural problem in Africa includes all of the options provided, not just reduced food security.", Correctness: false},
	}

	if len(result) != len(expected) {
		t.Fatalf("Expected %d questions, got %d", len(expected), len(result))
	}
}
