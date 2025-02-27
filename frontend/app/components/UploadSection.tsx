import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Quiz from './Quiz';

interface UploadSectionProps {
  onUploadSuccess?: (sectionId: string) => void;
}

export default function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [quizData, setQuizData] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [sectionId, setSectionId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
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
      setQuizData(data.quiz);
      setShowQuiz(true);
      setUploadSuccess(false); // Hide success message when showing quiz
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
    }
  };

  const handleGenerateQuiz = () => {
    if (sectionId) {
      fetchQuiz(sectionId);
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
      try {
        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);
        
        try {
          data = JSON.parse(rawResponse);
          console.log('Upload response:', data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
        } 
      } catch (error) {
        console.error('Error reading response:', error);
        throw new Error('Failed to read server response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Store section ID and show success message
      if (data.section_id) {
        localStorage.setItem('lastSectionId', data.section_id);
        setSectionId(data.section_id);
        onUploadSuccess?.(data.section_id);
        setUploadSuccess(true);
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

  return (
    <>
      <div className="w-full max-w-2xl mx-auto p-6">
        {uploadSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 space-y-6"
          >
            <div className="w-16 h-16 mx-auto cosmic-gradient rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold magical-text">
              PDF Uploaded Successfully!
            </h3>
            <p className="text-gray-600">
              Your PDF has been processed. Would you like to generate a quiz?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleGenerateQuiz}
                className="btn-primary px-8 py-3"
              >
                Generate Quiz
              </button>
              <button
                onClick={() => {
                  setUploadSuccess(false);
                  setSectionId('');
                }}
                className="btn-secondary px-8 py-3"
              >
                Upload Another PDF
              </button>
            </div>
          </motion.div>
        ) : (
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
              ref={fileInputRef}
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
                    Selected file: {file.name}
                  </p>
                  <button
                    onClick={uploadFile}
                    disabled={uploading}
                    className="btn-primary px-6 py-2"
                  >
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary px-6 py-2"
                  >
                    Browse Files
                  </button>
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
                  className="mt-4"
                >
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <motion.div
                      className="bg-[rgb(var(--ai-purple))] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* File Requirements */}
        {!uploadSuccess && (
          <div className="mt-4 text-sm text-gray-500">
            <h4 className="font-medium mb-2">File Requirements:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>PDF format only</li>
              <li>Maximum file size: 10MB</li>
              <li>Clear and readable content</li>
            </ul>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showQuiz && quizData && (
          <Quiz
            quiz={quizData}
            onClose={() => {
              setShowQuiz(false);
              setUploadSuccess(true); // Show success message again when closing quiz
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
} 