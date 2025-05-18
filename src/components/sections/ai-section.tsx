"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

export function AISection() {
  const [activeTab, setActiveTab] = useState('chatbot')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hello! I can help you explore this portfolio. What would you like to know about?' }
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<null | {
    strengths: string[];
    suggestions: string[];
    score: number;
  }>(null)
  
  // State for skill matching
  const [jobDescription, setJobDescription] = useState('')
  const [isMatchingSkills, setIsMatchingSkills] = useState(false)
  const [skillMatchResult, setSkillMatchResult] = useState<{
    overallMatch: number;
    matchedSkills: { name: string; confidence: number }[];
    missingSkills: string[];
    recommendation: string;
  } | null>(null)

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!chatMessage.trim()) return
    
    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', content: chatMessage }])
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I'm an AI assistant that can help you navigate this portfolio. I can tell you about projects, skills, or help you get in touch."
      
      if (chatMessage.toLowerCase().includes('project')) {
        response = "The portfolio features several impressive projects including an immersive 3D product configurator, AI-driven content creation platform, and interactive data visualizations. Which one would you like to explore further?"
      } else if (chatMessage.toLowerCase().includes('skill') || chatMessage.toLowerCase().includes('experience')) {
        response = "This portfolio showcases expertise in 3D development, UI/UX design, motion graphics, and AI integration. The skills section provides a detailed breakdown of technical and creative abilities."
      } else if (chatMessage.toLowerCase().includes('contact')) {
        response = "You can get in touch through the contact form in the Contact section, or directly via email at contact@example.com."
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }])
    }, 1000)
    
    setChatMessage('')
  }

  const handlePortfolioAnalysis = () => {
    setIsAnalyzing(true)
    
    // Simulate analysis process
    setTimeout(() => {
      setAnalysisResult({
        strengths: [
          "Strong visual design with cohesive color scheme",
          "Impressive 3D interactive elements",
          "Clear presentation of skills and expertise",
          "Compelling case studies with problem-solution format",
          "Modern, responsive layout with attention to detail"
        ],
        suggestions: [
          "Consider adding more detailed technical descriptions",
          "Expand on process documentation for key projects",
          "Include testimonials from past clients or collaborators",
          "Add downloadable assets or resources"
        ],
        score: 92
      })
      setIsAnalyzing(false)
    }, 3000)
  }
  
  // Handler for skill matching feature
  const handleSkillMatching = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) return
    
    setIsMatchingSkills(true)
    
    // Simulate AI processing
    setTimeout(() => {
      // Portfolio skills database - these would typically come from your actual portfolio data
      const portfolioSkills = [
        {name: "React", level: 0.9},
        {name: "Next.js", level: 0.85},
        {name: "TypeScript", level: 0.8},
        {name: "JavaScript", level: 0.95},
        {name: "HTML/CSS", level: 0.9},
        {name: "Tailwind CSS", level: 0.85},
        {name: "Node.js", level: 0.75},
        {name: "Express", level: 0.7},
        {name: "MongoDB", level: 0.65},
        {name: "SQL", level: 0.6},
        {name: "Git", level: 0.85},
        {name: "UI/UX Design", level: 0.7},
        {name: "Responsive Design", level: 0.85},
        {name: "API Integration", level: 0.8},
        {name: "Three.js", level: 0.75},
        {name: "GraphQL", level: 0.6},
        {name: "REST API", level: 0.8},
        {name: "Figma", level: 0.75},
        {name: "Animation", level: 0.8},
        {name: "Performance Optimization", level: 0.7}
      ]
      
      // Extract skills from job description (simplified simulation)
      const jobDescLower = jobDescription.toLowerCase()
      
      // Keywords that might indicate required skills in a job description
      const skillKeywords = [
        'react', 'next.js', 'nextjs', 'typescript', 'javascript', 'js', 'html', 'css', 
        'tailwind', 'node', 'express', 'mongodb', 'mongo', 'sql', 'mysql', 'postgresql', 
        'postgres', 'git', 'ui', 'ux', 'design', 'responsive', 'api', 'three.js', 'threejs',
        'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack', 'web development',
        'testing', 'jest', 'cypress', 'aws', 'cloud', 'docker', 'kubernetes', 'ci/cd', 'agile',
        'scrum', 'redux', 'graphql', 'rest', 'websocket', 'sass', 'less', 'webpack', 'babel',
        'authentication', 'authorization', 'security', 'performance', 'optimization', 'figma',
        'elasticsearch', 'sketch', 'adobe xd', 'photoshop', 'illustrator'
      ]
      
      // Extract required skills from job description
      const requiredSkills: string[] = []
      skillKeywords.forEach(keyword => {
        if (jobDescLower.includes(keyword)) {
          // Normalize skill names
          let normalizedSkill = keyword
          if (keyword === 'js') normalizedSkill = 'JavaScript'
          else if (keyword === 'nextjs') normalizedSkill = 'Next.js'
          else if (keyword === 'threejs') normalizedSkill = 'Three.js'
          else if (keyword === 'mongo') normalizedSkill = 'MongoDB'
          else if (keyword === 'postgres' || keyword === 'postgresql') normalizedSkill = 'SQL'
          else if (keyword === 'mysql') normalizedSkill = 'SQL'
          else if (keyword === 'ui' || keyword === 'ux') normalizedSkill = 'UI/UX Design'
          else if (keyword === 'frontend' || keyword === 'front-end') normalizedSkill = 'React'
          else if (keyword === 'responsive') normalizedSkill = 'Responsive Design'
          else if (keyword === 'optimization') normalizedSkill = 'Performance Optimization'
          else if (keyword === 'rest') normalizedSkill = 'REST API'
          else normalizedSkill = keyword.charAt(0).toUpperCase() + keyword.slice(1)
          
          // Only add if not already in the list
          if (!requiredSkills.includes(normalizedSkill)) {
            requiredSkills.push(normalizedSkill)
          }
        }
      })
      
      // Match portfolio skills with required skills
      const matchedSkills = portfolioSkills.filter(skill => 
        requiredSkills.some(req => req.toLowerCase() === skill.name.toLowerCase())
      ).map(skill => ({
        name: skill.name,
        confidence: skill.level // Use the portfolio skill level as confidence
      }))
      
      // Find missing skills
      const missingSkills = requiredSkills.filter(req => 
        !portfolioSkills.some(skill => skill.name.toLowerCase() === req.toLowerCase())
      )
      
      // Calculate overall match percentage
      const overallMatch = requiredSkills.length > 0 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
        : 0
      
      // Generate recommendation based on match percentage
      let recommendation = ''
      if (overallMatch >= 85) {
        recommendation = "You're an excellent match for this position! Your portfolio demonstrates most of the required skills."
      } else if (overallMatch >= 70) {
        recommendation = "You're a good match for this position. Consider highlighting your relevant experience in these areas."
      } else if (overallMatch >= 50) {
        recommendation = "You have some matching skills, but may need to develop expertise in the missing areas or emphasize transferable skills."
      } else {
        recommendation = "This position may require skills different from your current portfolio. Consider focusing on transferable skills if applying."
      }
      
      // Set the result
      setSkillMatchResult({
        overallMatch,
        matchedSkills,
        missingSkills,
        recommendation
      })
      
      setIsMatchingSkills(false)
    }, 2500)
  }

  return (
    <section id="ai-features" className="py-20 bg-background dark:bg-primary relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">AI-Powered Features</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            Explore interactive AI-powered tools designed to enhance your experience and provide personalized insights.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-primary/40 p-1 rounded-full shadow-md">
            <button 
              onClick={() => setActiveTab('chatbot')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'chatbot' 
                  ? 'bg-secondary text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Portfolio Assistant
            </button>
            <button 
              onClick={() => setActiveTab('analyzer')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'analyzer' 
                  ? 'bg-secondary text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Portfolio Analyzer
            </button>
            <button 
              onClick={() => setActiveTab('skillmatch')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'skillmatch' 
                  ? 'bg-secondary text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Skill Matcher
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'chatbot' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 bg-secondary text-white">
                <h3 className="font-display text-xl font-bold">Portfolio Assistant</h3>
                <p className="text-sm opacity-80">Ask questions about projects, skills, or how to get in touch</p>
              </div>
              
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-secondary text-white rounded-tr-none' 
                          : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about projects, skills, or contact info..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab === 'analyzer' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden p-6"
            >
              <h3 className="heading-md mb-4 text-center">AI Portfolio Analyzer</h3>
              <p className="body-md mb-6 text-center text-text/70 dark:text-background/70">
                Get an AI-powered analysis of this portfolio with personalized insights and recommendations.
              </p>
              
              {!analysisResult && !isAnalyzing && (
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePortfolioAnalysis}
                    className="px-8 py-3 bg-secondary text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Analyze Portfolio
                  </motion.button>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="mono">Analyzing portfolio content...</p>
                </div>
              )}
              
              {analysisResult && !isAnalyzing && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="heading-xl text-secondary">{analysisResult.score}</span>
                      </div>
                      <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#e6e6e6"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#6C63FF"
                          strokeWidth="12"
                          strokeDasharray="439.6"
                          strokeDashoffset={439.6 - (439.6 * analysisResult.score) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="font-display font-bold text-xl mb-3 text-secondary">Strengths</h4>
                      <ul className="space-y-2">
                        {analysisResult.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-accent">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="font-display font-bold text-xl mb-3 text-accent">Suggestions</h4>
                      <ul className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-secondary">→</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        setAnalysisResult(null)
                        setIsAnalyzing(false)
                      }}
                      className="px-6 py-2 border border-secondary text-secondary font-medium rounded-full hover:bg-secondary/10 transition-all"
                    >
                      Reset Analysis
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'skillmatch' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-primary/40 rounded-xl shadow-lg overflow-hidden p-6"
            >
              <h3 className="heading-md mb-4 text-center">AI Skill Matcher</h3>
              <p className="body-md mb-6 text-center text-text/70 dark:text-background/70">
                Paste a job description to see how well your skills match the requirements.
              </p>
              
              {!skillMatchResult && !isMatchingSkills && (
                <form onSubmit={handleSkillMatching} className="space-y-4">
                  <div>
                    <label htmlFor="jobDescription" className="block mb-2 font-medium">
                      Job Description
                    </label>
                    <textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                      rows={6}
                      placeholder="Paste the job description here..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-8 py-3 bg-secondary text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      Analyze Match
                    </motion.button>
                  </div>
                </form>
              )}
              
              {isMatchingSkills && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="mono">Analyzing skill match...</p>
                </div>
              )}
              
              {skillMatchResult && !isMatchingSkills && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="heading-xl text-secondary">{skillMatchResult.overallMatch}%</span>
                      </div>
                      <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#e6e6e6"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#6C63FF"
                          strokeWidth="12"
                          strokeDasharray="439.6"
                          strokeDashoffset={439.6 - (439.6 * skillMatchResult.overallMatch) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
                    <p className="font-medium text-center">{skillMatchResult.recommendation}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="font-display font-bold text-xl mb-3 text-secondary">Matched Skills</h4>
                      <ul className="space-y-2">
                        {skillMatchResult.matchedSkills.map((skill, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span className="text-accent">✓</span>
                              <span>{skill.name}</span>
                            </span>
                            <span className="text-sm bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                              {Math.round(skill.confidence * 100)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {skillMatchResult.missingSkills.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-display font-bold text-xl mb-3 text-red-500">Skills to Develop</h4>
                        <ul className="space-y-2">
                          {skillMatchResult.missingSkills.map((skill, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        setSkillMatchResult(null);
                        setJobDescription('');
                      }}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Try Another
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-secondary/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl"></div>
    </section>
  )
}
