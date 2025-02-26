"use client";
import React, { useState } from "react";

const questions = [
  {
    question: "What is the primary function of a market economy system?",
    options: [
      "A. Central planning of resources",
      "B. Resource allocation through price mechanism",
      "C. Government control of production",
      "D. Equal distribution of wealth",
    ],
    correct: 1,
  },
  {
    question: "What does GDP stand for?",
    options: [
      "A. Gross Domestic Product",
      "B. General Domestic Policy",
      "C. Global Development Plan",
      "D. Government Debt Percentage",
    ],
    correct: 0,
  },
  {
    question: "Which factor is considered a primary economic resource?",
    options: ["A. Money", "B. Land", "C. Technology", "D. Government"],
    correct: 1,
  },
  {
    question: "What is inflation?",
    options: [
      "A. A rise in the general price level",
      "B. An increase in total population",
      "C. A decrease in unemployment",
      "D. A rise in government revenue",
    ],
    correct: 0,
  },
  {
    question: "What is an example of a capital good?",
    options: [
      "A. A personal car",
      "B. A factory machine",
      "C. A home appliance",
      "D. A school textbook",
    ],
    correct: 1,
  },
  {
    question: "Which organization regulates international trade?",
    options: [
      "A. World Trade Organization",
      "B. United Nations",
      "C. International Monetary Fund",
      "D. European Union",
    ],
    correct: 0,
  },
  {
    question: "What is the law of demand?",
    options: [
      "A. Demand decreases as price decreases",
      "B. Demand increases as price decreases",
      "C. Demand and price are unrelated",
      "D. Demand is constant regardless of price",
    ],
    correct: 1,
  },
  {
    question: "Which economic system is characterized by private ownership?",
    options: [
      "A. Socialism",
      "B. Communism",
      "C. Capitalism",
      "D. Traditional economy",
    ],
    correct: 2,
  },
  {
    question: "What is opportunity cost?",
    options: [
      "A. The cost of an alternative forgone",
      "B. The price of a product",
      "C. The profit gained from an investment",
      "D. The cost of production",
    ],
    correct: 0,
  },
  {
    question: "Which factor affects supply in a market?",
    options: [
      "A. Consumer preference",
      "B. Cost of production",
      "C. Personal income",
      "D. Social trends",
    ],
    correct: 1,
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleNext = () => {
    if (selectedOption !== null) {
      if (selectedOption === questions[currentQuestion].correct) {
        setCorrectCount(correctCount + 1);
      } else {
        setWrongCount(wrongCount + 1);
      }
      setSelectedOption(null);
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        setQuizCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const scorePercentage = (correctCount / questions.length) * 100;

  const getFeedback = () => {
    if (scorePercentage >= 80) {
      return "Excellent work! You have a strong understanding of economics.";
    } else if (scorePercentage >= 50) {
      return "Good job! You have a decent understanding, but there's room for improvement.";
    } else {
      return "Keep practicing! Review the concepts and try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 relative">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        {quizCompleted ? (
          <div>
            <h2 className="text-xl font-bold mb-2">Quiz Completed!</h2>
            <div className="flex justify-between text-gray-600 mb-4">
              <span className="text-sm">Correct: {correctCount}</span>
              <span className="text-sm">Wrong: {wrongCount}</span>
            </div>
            <h3 className="text-lg font-medium mb-4">
              Your Score: {scorePercentage.toFixed(2)}%
            </h3>
            <p className="text-md">{getFeedback()}</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">{`Question ${
              currentQuestion + 1
            }:`}</h2>
            <div className="flex justify-between text-gray-600 mb-4">
              <span className="text-sm">Question {currentQuestion + 1}/10</span>
              <span className="text-sm">
                Correct: {correctCount} | Wrong: {wrongCount}
              </span>
            </div>

            <h3 className="text-lg font-medium mb-4">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                    selectedOption === index ? "bg-blue-100" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz"
                    className="form-radio text-blue-600"
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePrevious}
                className="text-blue-600 hover:underline"
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <div className="flex-1 h-2 bg-gray-200 rounded-lg mx-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full"
                  style={{
                    width: `${(currentQuestion / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
                disabled={selectedOption === null}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
