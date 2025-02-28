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
  [key: string]: string;
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

interface TopicItem {
  Title: string;
  Explanation: string;
}

interface TopicData {
  section: {
    Topics: TopicItem[];
  };
}

interface Section {
  ID: string;
  SectionName: string;
  PDFID: string;
  QuestionsID: string;
  ExplanationsID: string;
  AnswersID: string;
  CreatedBy: string;
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
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const [expandedTopicIndex, setExpandedTopicIndex] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingExplanations, setLoadingExplanations] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('userEmail');
    if (token && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoadingSections(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/r/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      setSections(data.sections || []); // Add default empty array if data.sections is undefined
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSectionClick = async (sectionId: string) => {
    setSelectedSection(sectionId);
    localStorage.setItem('lastSectionId', sectionId);
    await fetchQuiz(sectionId);
    
    // Scroll to top of page
    window.scrollTo({
      top: 200,
      behavior: 'smooth'
    });
  };

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
      console.log('Quiz data received:', data);
      
      if (data.quiz.Taken) {
        setShowModal(false); // Don't show modal, directly fetch topics
        await fetchTopics();
      } else {
        // Show quiz for untaken quizzes
        const limitedQuestions = data.quiz.Questions.slice(0, 10);
        setQuizData({
          ...data.quiz,
          Questions: limitedQuestions
        });
        setSelectedAnswers({});
        setShowResults(false);
        setCurrentQuestionIndex(0);
        setShowFinalScore(false);
        setShowExplanations(false);
        setShowTopics(false);
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
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
    if (currentQuestionIndex === (quizData?.Questions?.length || 1) - 1) {
      setShowFinalScore(true);
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const fetchExplanations = async () => {
    try {
      setLoadingExplanations(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view explanations');
      }

      const sectionId = localStorage.getItem('lastSectionId');
      if (!sectionId) {
        throw new Error('No section ID found. Please try uploading the document again.');
      }

      // Format answers for submission
      const formattedAnswers = Object.entries(selectedAnswers).map(([index, answer]) => ({
        question_no: parseInt(index) + 1,
        answer: answer
      }));

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      
      // First submit the answers
      console.log('Submitting answers:', formattedAnswers);
      const submitResponse = await fetch(`${baseUrl}/a/quiz_answer?section_id=${sectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          answers: formattedAnswers
        })
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error('Failed to submit answers:', errorText);
        throw new Error('Failed to submit answers. Please try again.');
      }

      // Then fetch the explanations
      console.log('Fetching explanations for section:', sectionId);
      const url = `${baseUrl}/r/explanation?section_id=${sectionId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to fetch explanations: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received explanation data:', data);

      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format: explanations should be an array');
      }

      setExplanations(data);
      setShowExplanations(true);
      
    } catch (err) {
      console.error('Explanation fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch explanations');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingExplanations(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view topics');
      }

      const sectionId = localStorage.getItem('lastSectionId');
      if (!sectionId) {
        throw new Error('No section ID found');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      
      // Try to create the topic, but don't fail if it already exists
      try {
        console.log('Creating topic for section:', sectionId);
        const createTopicResponse = await fetch(`${baseUrl}/a/more?section_id=${sectionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // If the error is not "conversation already created", then throw it
        if (!createTopicResponse.ok) {
          const errorText = await createTopicResponse.text();
          if (!errorText.includes('conversation already created')) {
            console.error('Failed to create topic:', {
              status: createTopicResponse.status,
              statusText: createTopicResponse.statusText,
              error: errorText
            });
            throw new Error('Failed to create topic');
          }
        }
      } catch (createError) {
        // Only rethrow if it's not the "conversation already created" error
        if (createError instanceof Error && !createError.message.includes('conversation already created')) {
          throw createError;
        }
      }

      // Proceed with fetching topics regardless of creation status
      console.log('Fetching topic content for section:', sectionId);
      const topicResponse = await fetch(`${baseUrl}/r/topic?section_id=${sectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!topicResponse.ok) {
        const errorText = await topicResponse.text();
        console.error('Topic fetch failed:', {
          status: topicResponse.status,
          statusText: topicResponse.statusText,
          error: errorText
        });
        throw new Error('Failed to fetch topics');
      }

      const topicData: TopicData = await topicResponse.json();
      console.log('Topic content received:', topicData);
      
      setTopics(topicData.section.Topics);
      setShowTopics(true);
      setShowModal(false);
      
      // Scroll to top with offset for navbar
      setTimeout(() => {
        window.scrollTo({
          top: 100, // Fixed offset for navbar
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure content is rendered
      
    } catch (err) {
      console.error('Topic fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingTopics(false);
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
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold magical-text mb-6">
              Transform Your Learning Experience
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Upload your study materials and let our AI create personalized quizzes to help you master any subject.
            </p>
          </motion.div>

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

              {/* Previous Sections Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[rgba(var(--ai-purple),0.1)]">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 cosmic-gradient rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold magical-text">Previous Sections</h3>
                </div>

                {loadingSections ? (
                  <div className="flex justify-center py-8">
                    <div className="cosmic-gradient w-8 h-8 rounded-full animate-spin">
                      <div className="w-full h-full rounded-full border-4 border-t-transparent"></div>
                    </div>
                  </div>
                ) : sections && sections.length > 0 ? (
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <motion.button
                        key={section.ID}
                        onClick={() => handleSectionClick(section.ID)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          selectedSection === section.ID
                            ? 'border-[rgb(var(--ai-purple))] bg-[rgba(var(--ai-purple),0.05)]'
                            : 'border-gray-200 hover:border-[rgb(var(--ai-purple))] hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 cosmic-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-gray-800 truncate">
                              {section.SectionName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Click to view content breakdown
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No previous sections found</p>
                  </div>
                )}
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
                    {selectedSection ? 'Content Breakdown' : 'Ready for Assessment'}
                  </h2>
                </div>
              </div>

              <div className="p-4">
                {quizData ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {!showTopics && !showExplanations && !showFinalScore && (
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-[rgba(var(--ai-purple),0.2)]">
                          <h4 className="font-medium text-gray-800 mb-4">
                            Question {currentQuestionIndex + 1} of {quizData.Questions.length}
                          </h4>
                          <p className="text-lg text-gray-700 mb-6">
                            {quizData.Questions[currentQuestionIndex]?.Question}
                          </p>
                          <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map((option) => (
                              <button
                                key={option}
                                onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                                disabled={!!selectedAnswers[currentQuestionIndex]}
                                className={`w-full p-4 rounded-xl border-2 transition-all ${
                                  selectedAnswers[currentQuestionIndex] === option
                                    ? 'border-[rgb(var(--ai-purple))] bg-[rgba(var(--ai-purple),0.05)]'
                                    : 'border-gray-200 hover:border-[rgb(var(--ai-purple))] hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium">{option}:</span>
                                  <span>{quizData.Questions[currentQuestionIndex]?.[option]}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          {feedback[currentQuestionIndex] && (
                            <div className={`mt-4 p-4 rounded-xl ${
                              feedback[currentQuestionIndex].correct 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {feedback[currentQuestionIndex].message}
                            </div>
                          )}
                          {selectedAnswers[currentQuestionIndex] && !showFinalScore && (
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={handleNextQuestion}
                                className="btn-primary px-6 py-2"
                              >
                                {currentQuestionIndex === (quizData.Questions.length - 1) 
                                  ? 'View Results' 
                                  : 'Next Question'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {showFinalScore && !showExplanations && !showTopics && (
                      <div className="text-center">
                        <div className="mb-6">
                          <div className="w-24 h-24 cosmic-gradient rounded-full mx-auto flex items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-white">
                              {calculateScore().percentage}%
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold magical-text">
                            Quiz Complete!
                          </h3>
                          <p className="text-gray-600 mt-2">
                            You got {calculateScore().correct} out of {calculateScore().total} questions correct
                          </p>
                        </div>
                        <button
                          onClick={fetchExplanations}
                          disabled={loadingExplanations}
                          className="btn-primary px-8 py-3"
                        >
                          {loadingExplanations ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading Explanations...</span>
                            </div>
                          ) : (
                            'View Explanations'
                          )}
                        </button>
                      </div>
                    )}
                    {showExplanations && !showTopics && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold magical-text mb-4">Explanations</h3>
                        {explanations.map((item, index) => (
                          <div key={index} className="bg-white p-6 rounded-xl border border-[rgba(var(--ai-purple),0.2)]">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-800">Question {item.question_number}</h4>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                item.correctness ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {item.correctness ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-600">Your answer: {item.your_answer}</p>
                              <p className="text-gray-600">Correct answer: {item.correct_answer}</p>
                              <p className="text-gray-700 mt-4">{item.explanation}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={fetchTopics}
                            disabled={loadingTopics}
                            className="btn-primary px-6 py-2"
                          >
                            {loadingTopics ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading Content...</span>
                              </div>
                            ) : (
                              'View Content Breakdown'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {showTopics && (
                      <div className="space-y-4">
                        {topics.map((topic, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-[rgba(var(--ai-purple),0.2)] rounded-xl overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedTopicIndex(expandedTopicIndex === index ? null : index)}
                              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-medium text-gray-800">{topic.Title}</span>
                              <motion.div
                                animate={{ rotate: expandedTopicIndex === index ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="w-5 h-5 text-[rgb(var(--ai-purple))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {expandedTopicIndex === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t border-[rgba(var(--ai-purple),0.1)]"
                                >
                                  <div className="p-6 bg-[rgba(var(--ai-purple),0.02)]">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      {topic.Explanation}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
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
                      Select a Section
                    </h3>
                    <p className="text-lg text-gray-600">
                      Choose a section from the list to view its content breakdown
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold magical-text">
                  Sign In Required
                </h3>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Please sign in to access the quiz features and upload PDF documents.
              </p>
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="btn-primary w-full py-2 text-center"
                  onClick={() => setShowAuthModal(false)}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="btn-secondary w-full py-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
