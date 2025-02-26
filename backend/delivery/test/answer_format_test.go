package test

import (
	"github/chera/fix-it/domain"
	"github/chera/fix-it/infrastructure"
	"testing"
)

func TestFormatAnswer(t *testing.T) {
	test := []domain.Answer{
		{QuestionNO: 1, Answer: "A"},
		{QuestionNO: 2, Answer: "B"},
	}

	result := infrastructure.ParseAnswer(test)

	expected := "1, A\n2, B\n"

	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}
