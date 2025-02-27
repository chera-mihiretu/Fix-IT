'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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

interface ExplanationItem {
  question_number: number;
  correct_answer: string;
  your_answer: string;
  explanation: string;
  correctness: boolean;
}

export default function QuizPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [feedback, setFeedback] = useState<{ [key: number]: { correct: boolean; message: string } }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [explanations, setExplanations] = useState<ExplanationItem[]>([]);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('userEmail');
    if (token && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      setError('');
    }
  };

  const validateFile = (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size should be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to upload files');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/a/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      let data;
      const rawResponse = await response.text();
      
      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Store section ID and fetch quiz
      if (data.section_id) {
        localStorage.setItem('lastSectionId', data.section_id);
        await fetchQuiz(data.section_id);
      }
      
      // Reset state
      setFile(null);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const fetchQuiz = async (sectionId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view the quiz');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/r/quiz?section_id=${sectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      // Ensure we only take 10 questions
      const limitedQuestions = data.quiz.Questions.slice(0, 10);
      setQuizData({
        ...data.quiz,
        Questions: limitedQuestions
      });
      setSelectedAnswers({});
      setShowResults(false);
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (selectedAnswers[questionIndex]) return; // Prevent changing answer after selection

    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));

    const question = quizData?.Questions[questionIndex];
    if (question) {
      const isCorrect = answer === question.Answer;
      setFeedback(prev => ({
        ...prev,
        [questionIndex]: {
          correct: isCorrect,
          message: isCorrect 
            ? '🎉 Correct! Well done!' 
            : `❌ Incorrect. The correct answer is ${question.Answer}: ${question[question.Answer as keyof Question]}`
        }
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    quizData.Questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.Answer) {
        correct++;
      }
    });
    
    return {
      correct,
      total: quizData.Questions.length,
      percentage: Math.round((correct / quizData.Questions.length) * 100)
    };
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === (quizData?.Questions.length || 1) - 1) {
      setShowFinalScore(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const fetchExplanations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view explanations');
      }

      const sectionId = localStorage.getItem('lastSectionId');
      if (!sectionId) {
        throw new Error('No section ID found. Please try uploading the document again.');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const url = `${baseUrl}/r/explanation?section_id=${sectionId}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const rawResponse = await response.text();
      console.log('Raw response:', rawResponse);

      if (!response.ok) {
        throw new Error(`Failed to fetch explanations: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = JSON.parse(rawResponse);
        console.log('Parsed explanation data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format: explanations should be an array');
      }

      setExplanations(data);
      setShowExplanations(true);
      
    } catch (err) {
      console.error('Explanation fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch explanations');
      // Keep the error visible for longer so user can read it
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[rgba(var(--ai-purple),0.1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/assets/logo.svg"
                  alt="Fix-IT Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl md:text-2xl font-bold magical-text">
                Fix-IT
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full cosmic-gradient flex items-center justify-center text-white font-semibold">
                      {userEmail[0]?.toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-gray-700">{userEmail}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/" className="btn-primary glow-effect">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4 pb-20">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold magical-text text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Executive Learning Platform
          </motion.h1>
          
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Panel - PDF Upload and Info */}
            <motion.div 
              className="lg:w-1/3 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Upload Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[rgba(var(--ai-purple),0.1)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 cosmic-gradient rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold magical-text">Document Upload</h2>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                    isDragging 
                      ? 'border-[rgb(var(--ai-purple))] bg-[rgb(var(--ai-purple))]/5' 
                      : 'border-gray-300 hover:border-[rgb(var(--ai-purple))]'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileSelect}
                  />

                  <div className="text-center">
                    <div className="mb-4">
                      <svg
                        className={`w-16 h-16 mx-auto ${isDragging ? 'text-[rgb(var(--ai-purple))]' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>

                    {file ? (
                      <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-700">
                          Selected: {file.name}
                        </p>
                        <button
                          onClick={uploadFile}
                          disabled={uploading}
                          className="btn-primary px-8 py-3 w-full"
                        >
                          {uploading ? 'Processing...' : 'Generate Executive Quiz'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Drag and drop your document
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          or
                        </p>
                        <label
                          htmlFor="file-upload"
                          className="btn-secondary px-8 py-3 cursor-pointer inline-block"
                        >
                          Select File
                        </label>
                      </>
                    )}
                  </div>

                  {/* Upload Progress */}
                  <AnimatePresence>
                    {uploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6"
                      >
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <motion.div
                            className="cosmic-gradient h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2">Processing document...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Requirements Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[rgba(var(--ai-purple),0.1)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 cosmic-gradient rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold magical-text">Requirements</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-[rgb(var(--ai-purple))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">PDF format only</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-[rgb(var(--ai-purple))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Maximum size: 10MB</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-[rgb(var(--ai-purple))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Clear and readable content</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right Panel - Quiz Display */}
            <motion.div 
              className="lg:w-2/3 bg-white rounded-xl shadow-lg border border-[rgba(var(--ai-purple),0.1)] overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-4 border-b border-[rgba(var(--ai-purple),0.1)]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 cosmic-gradient rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold magical-text">
                    {quizData ? 'Executive Assessment' : 'Ready for Assessment'}
                  </h2>
                </div>
              </div>

              <div className="p-4">
                {quizData ? (
                  <div className="space-y-8">
                    {showFinalScore ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4"
                      >
                        <div className="text-center space-y-4">
                          <h3 className="text-xl font-bold magical-text">Assessment Complete! 🎉</h3>
                          <div className="cosmic-gradient text-white rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                            <span className="text-2xl font-bold">{calculateScore().percentage}%</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              You got <span className="font-bold text-[rgb(var(--ai-purple))]">{calculateScore().correct}</span> out of <span className="font-bold">{calculateScore().total}</span> questions correct
                            </p>
                          </div>

                          {!showExplanations ? (
                            <div className="flex justify-center space-x-3 mt-4">
                              <button
                                onClick={fetchExplanations}
                                className="btn-primary px-6 py-2 text-sm"
                              >
                                View Explanations
                              </button>
                              <button
                                onClick={() => {
                                  setQuizData(null);
                                  setShowFinalScore(false);
                                  setSelectedAnswers({});
                                  setFeedback({});
                                  setCurrentQuestionIndex(0);
                                }}
                                className="btn-secondary px-6 py-2 text-sm"
                              >
                                Upload New PDF
                              </button>
                            </div>
                          ) : (
                            <div className="mt-8">
                              <div className="space-y-6">
                                {explanations.map((item, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-xl border ${
                                      item.correctness 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-red-200 bg-red-50'
                                    }`}
                                  >
                                    <div className="flex items-start space-x-4">
                                      <div className={`p-2 rounded-lg ${
                                        item.correctness 
                                          ? 'bg-green-100' 
                                          : 'bg-red-100'
                                      }`}>
                                        <span className="text-lg font-bold">
                                          Q{item.question_number}
                                        </span>
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-4">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">Your Answer:</span>
                                            <span className={`px-2 py-1 rounded ${
                                              item.correctness 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              {item.your_answer}
                                            </span>
                                          </div>
                                          {!item.correctness && (
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium">Correct Answer:</span>
                                              <span className="px-2 py-1 rounded bg-green-100 text-green-700">
                                                {item.correct_answer}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        {item.explanation && item.explanation !== "N/A" && (
                                          <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100">
                                            <span className="font-medium">Explanation: </span>
                                            {item.explanation}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              <div className="mt-6 flex justify-center">
                                <button
                                  onClick={() => {
                                    setQuizData(null);
                                    setShowFinalScore(false);
                                    setSelectedAnswers({});
                                    setFeedback({});
                                    setCurrentQuestionIndex(0);
                                    setShowExplanations(false);
                                  }}
                                  className="btn-secondary px-6 py-2 text-sm"
                                >
                                  Upload New PDF
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {/* Question Display */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Question {currentQuestionIndex + 1}
                            </h3>
                            <div className="bg-[rgb(var(--ai-purple))]/10 px-3 py-1 rounded-full">
                              <span className="text-sm text-[rgb(var(--ai-purple))] font-medium">
                                {currentQuestionIndex + 1} of {quizData?.Questions?.length || 10}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full cosmic-gradient"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${((currentQuestionIndex + 1) / (quizData?.Questions?.length || 10)) * 100}%` 
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>

                          {/* Question Content */}
                          <div className="bg-gray-50 rounded-xl p-4 border border-[rgba(var(--ai-purple),0.1)]">
                            <p className="text-base font-medium text-gray-800 mb-4">
                              {quizData?.Questions[currentQuestionIndex]?.Question}
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                              {['A', 'B', 'C', 'D'].map((option) => {
                                const currentQuestion = quizData?.Questions[currentQuestionIndex];
                                const answerText = currentQuestion?.[option as keyof Question] || '';
                                return (
                                  <motion.button
                                    key={option}
                                    onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                      selectedAnswers[currentQuestionIndex] === option
                                        ? feedback[currentQuestionIndex]?.correct
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-[rgb(var(--ai-purple))] hover:bg-white'
                                    }`}
                                    disabled={selectedAnswers[currentQuestionIndex] !== undefined}
                                    whileHover={{ scale: selectedAnswers[currentQuestionIndex] ? 1 : 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-medium ${
                                        selectedAnswers[currentQuestionIndex] === option
                                          ? feedback[currentQuestionIndex]?.correct
                                            ? 'border-green-500 bg-green-100 text-green-700'
                                            : 'border-red-500 bg-red-100 text-red-700'
                                          : 'border-gray-300 text-gray-600'
                                      }`}>
                                        {option}
                                      </span>
                                      <span className="text-sm flex-1">{answerText}</span>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Feedback Card */}
                          {feedback[currentQuestionIndex] && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-lg ${
                                feedback[currentQuestionIndex].correct
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-red-50 border border-red-200'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-1.5 rounded-lg ${
                                  feedback[currentQuestionIndex].correct
                                    ? 'bg-green-100'
                                    : 'bg-red-100'
                                }`}>
                                  {feedback[currentQuestionIndex].correct ? (
                                    <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </div>
                                <p className={`text-sm flex-grow ${
                                  feedback[currentQuestionIndex].correct
                                    ? 'text-green-700'
                                    : 'text-red-700'
                                }`}>
                                  {feedback[currentQuestionIndex].message}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Previous</span>
                          </button>
                          <button
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswers[currentQuestionIndex]}
                            className="btn-primary px-4 py-2 text-sm disabled:opacity-50 flex items-center space-x-2"
                          >
                            <span>
                              {currentQuestionIndex === (quizData?.Questions?.length || 10) - 1 
                                ? 'Complete Quiz' 
                                : 'Next Question'
                              }
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="mb-8"
                    >
                      <div className="w-24 h-24 cosmic-gradient rounded-2xl mx-auto flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold magical-text mb-4">
                      Ready for Your Assessment
                    </h3>
                    <p className="text-lg text-gray-600">
                      Upload your document to begin the executive learning experience
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 cosmic-gradient text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/assets/logo.svg"
                    alt="Fix-IT Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-2xl font-bold">Fix-IT</span>
              </div>
              <p className="text-gray-200 mb-6">
                Transform your learning experience with our AI-powered quiz generator.
                Upload your study materials and watch as we create personalized quizzes
                to help you master any subject.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-200 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="text-gray-200 hover:text-white transition-colors">
                    Generate Quiz
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-200">support@fix-it.com</li>
                <li className="text-gray-200">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-200">
            <p>© {new Date().getFullYear()} Fix-IT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 