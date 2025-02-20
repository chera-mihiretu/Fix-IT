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
