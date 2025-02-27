'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AuthModal from './components/AuthModal';
import UploadSection from './components/UploadSection';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const sparkleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 3
    }
  }
};

export default function Home() {
  const navItems = ["Features", "How It Works", "Testimonials", "Pricing"];
  const [particles, setParticles] = useState<{ x: number; y: number; }[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const [showUpload, setShowUpload] = useState(false);
  const [lastSectionId, setLastSectionId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('userEmail');
    if (token && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
  };

  // Particle effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.9) {
        const particle = {
          x: e.clientX,
          y: e.clientY
        };
        setParticles(prev => [...prev.slice(-5), particle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const handleUploadSuccess = (sectionId: string) => {
    setLastSectionId(sectionId);
    setShowUpload(false);
    // You can add a success notification here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          // Check auth status after modal closes
          const token = localStorage.getItem('authToken');
          const storedEmail = localStorage.getItem('userEmail');
          if (token && storedEmail) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
          }
        }} 
      />
      
      {/* Scroll Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{ x: particle.x, y: particle.y }}
          animate={{
            y: particle.y + 100,
            opacity: 0
          }}
          transition={{ duration: 1 }}
          onAnimationComplete={() => {
            setParticles(prev => prev.filter((_, index) => index !== i));
          }}
        />
      ))}

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[rgba(var(--ai-purple),0.1)]"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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
            </motion.div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="nav-link"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <motion.div 
              className="hidden md:flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary glow-effect"
                >
                  Get Started
                </button>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4"
              >
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="nav-link block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  {/* Mobile Auth Buttons */}
                  {isLoggedIn ? (
                    <div className="space-y-2 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full cosmic-gradient flex items-center justify-center text-white font-semibold">
                          {userEmail[0]?.toUpperCase()}
                        </div>
                        <span className="text-gray-700">{userEmail}</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full btn-secondary text-sm px-4 py-2"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full btn-primary glow-effect mx-4"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 md:pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070"
            alt="Background"
            fill
            className="object-cover opacity-5"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-gray-50"></div>
        </div>

        {/* Magical Sparkles */}
        <motion.div
          className="sparkle"
          style={{ top: "30%", left: "15%" }}
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="sparkle"
          style={{ top: "40%", right: "25%" }}
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="sparkle"
          style={{ bottom: "30%", left: "35%" }}
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        />

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div 
              className="space-y-6 max-w-2xl mx-auto text-center lg:text-left"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              <motion.div 
                className="inline-block"
                variants={fadeInUp}
              >
                <span className="cosmic-gradient text-white px-4 py-2 rounded-full text-sm font-medium">
                  AI-Powered Learning
                </span>
              </motion.div>
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight magical-text whitespace-nowrap"
                variants={fadeInUp}
              >
                Learn Smarter with AI
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed"
                variants={fadeInUp}
              >
                Upload your study materials and let AI create personalized quizzes for you.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <motion.button 
                  className="btn-primary glow-effect flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <span>Unlock My Brain's Superpowers</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.button>
                <motion.button 
                  className="btn-secondary flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isLoggedIn ? setShowUpload(true) : setIsAuthModalOpen(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isLoggedIn ? 'Upload PDF' : 'Watch the Magic'}
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative lg:h-[600px] h-[300px] sm:h-[400px] mt-8 lg:mt-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <Image
                  src="/assets/hero.svg"
                  alt="AI Learning Platform"
                  width={600}
                  height={600}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            />
          </svg>
        </div>
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-2">
                <UploadSection onUploadSuccess={handleUploadSuccess} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message for Upload */}
      <AnimatePresence>
        {lastSectionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-700">
              PDF processed successfully! Section ID: {lastSectionId}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <motion.section 
        className="py-12 cosmic-gradient text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="text-4xl font-bold mb-2 text-white"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 magical-text">
              Premium Features for Premium Learning
            </h2>
            <p className="text-xl text-gray-600">
              Experience the power of AI-driven learning with our comprehensive feature set
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card group glow-effect"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2 magical-text">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 magical-text">Your Learning Journey</h2>
            <p className="text-xl text-gray-600">
              Embark on a magical journey to knowledge mastery
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="step-card text-center"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full cosmic-gradient text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-xl font-bold mb-4 magical-text">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cosmic-gradient text-white py-16 relative overflow-hidden">
        <motion.div 
          className="container mx-auto px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="col-span-2">
              <motion.div 
                className="flex items-center space-x-2 mb-6"
                whileHover={{ scale: 1.05 }}
              >
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
              </motion.div>
              <p className="text-gray-200 mb-6">
                Revolutionizing education through artificial intelligence. Join thousands of students 
                who are already experiencing the future of learning.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="text-gray-200 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-200 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-200 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-200 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-200">
            <p>© {new Date().getFullYear()} Fix-IT. All rights reserved.</p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📚",
    title: "Smart PDF Processing",
    description: "Upload your study materials and let our AI extract key information with precision."
  },
  {
    icon: "🎯",
    title: "Personalized Quizzes",
    description: "Get custom-tailored questions that adapt to your learning progress."
  },
  {
    icon: "💡",
    title: "Intelligent Feedback",
    description: "Receive detailed explanations and targeted recommendations for improvement."
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description: "Monitor your learning journey with sophisticated analytics and insights."
  },
  {
    icon: "🔍",
    title: "Topic Generation",
    description: "Focus on your weak areas with AI-generated study topics and resources."
  },
  {
    icon: "🌟",
    title: "Premium Experience",
    description: "Enjoy a luxurious learning environment designed for excellence."
  }
];

const stats = [
  { value: "1M+", label: "Happy Students" },
  { value: "50K+", label: "Smart Quizzes" },
  { value: "95%", label: "Pass Rate" },
  { value: "24/7", label: "Expert Support" }
];

const steps = [
  {
    title: "Upload Your Material",
    description: "Simply upload your PDF study materials to our platform."
  },
  {
    title: "Get AI-Generated Quizzes",
    description: "Our AI analyzes your content and creates personalized quizzes."
  },
  {
    title: "Track Your Progress",
    description: "Review your performance and focus on areas that need improvement."
  }
];

const socialLinks = [
  {
    href: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    href: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  },
  {
    href: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.18.69.8.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/>
      </svg>
    )
  },
  {
    href: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
];

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#", label: "Testimonials" },
  { href: "#", label: "FAQ" }
];

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Blog" },
  { href: "#", label: "Contact" }
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Cookie Policy" },
  { href: "#", label: "GDPR" }
];
