import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  Question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  Answer: string;
}

interface QuizData {
  ID: string;
  Taken: boolean;
  Questions: Question[];
  CreatedBy: string;
}

interface QuizProps {
  quiz: QuizData;
  onClose: () => void;
}

export default function Quiz({ quiz, onClose }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.Questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.Answer) {
        correct++;
      }
    });
    return {
      score: correct,
      total: quiz.Questions.length,
      percentage: Math.round((correct / quiz.Questions.length) * 100)
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowResults(true);
    // Here you can add API call to submit the quiz results
    setIsSubmitting(false);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header - Made more compact */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold magical-text">
              {showResults ? 'Quiz Results' : `Question ${currentQuestion + 1} of ${quiz.Questions.length}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!showResults && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                className="cosmic-gradient h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / quiz.Questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Quiz Content - Optimized spacing */}
        <div className="flex-1 overflow-y-auto">
          {showResults ? (
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 magical-text">
                  {calculateScore().percentage}%
                </div>
                <p className="text-base text-gray-600">
                  You got {calculateScore().score} out of {calculateScore().total} questions correct
                </p>
              </div>

              <div className="space-y-3">
                {quiz.Questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border text-sm"
                    style={{
                      borderColor: selectedAnswers[index] === question.Answer ? '#4CAF50' : '#EF4444'
                    }}
                  >
                    <p className="font-medium mb-2">{question.Question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div
                          key={option}
                          className={`p-2 rounded text-sm ${
                            option === question.Answer
                              ? 'bg-green-100 border-green-500'
                              : selectedAnswers[index] === option
                              ? 'bg-red-100 border-red-500'
                              : 'bg-gray-50'
                          } border`}
                        >
                          <span className="font-medium">{option}:</span> {question[option as keyof Question]}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <p className="text-base font-medium">{quiz.Questions[currentQuestion].Question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`p-3 rounded-lg border text-left transition-all text-sm ${
                      selectedAnswers[currentQuestion] === option
                        ? 'border-[rgb(var(--ai-purple))] bg-[rgb(var(--ai-purple))]/5'
                        : 'border-gray-200 hover:border-[rgb(var(--ai-purple))]'
                    }`}
                  >
                    <span className="font-medium">{option}:</span>{' '}
                    {quiz.Questions[currentQuestion][option as keyof Question]}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - More compact */}
        <div className="p-4 border-t border-gray-200">
          {showResults ? (
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="btn-secondary text-sm px-6 py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedAnswers({});
                  setCurrentQuestion(0);
                }}
                className="btn-primary text-sm px-6 py-2"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="btn-secondary text-sm px-6 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestion < quiz.Questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!selectedAnswers[currentQuestion]}
                  className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    Object.keys(selectedAnswers).length !== quiz.Questions.length
                  }
                  className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 