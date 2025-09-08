import { useState, useEffect } from 'react'
import './App.css'

// Define Question interface locally to avoid import issues
interface Question {
  id: number;
  type: 'mcq' | 'short_answer';
  topic: string;
  stem: string;
  options?: string[];
  answer: string;
}

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

interface SubmissionData {
  question_id: number;
  user_answer: string;
  time_spent?: number;
}

interface Submission {
  id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  time_spent?: number;
  created_at: string;
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [currentView, setCurrentView] = useState<'practice' | 'submissions'>('practice')
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [showOnlyWrong, setShowOnlyWrong] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setAccessToken(token)
      setIsLoggedIn(true)
      loadQuestions()
      loadSubmissions()
    }
  }, [])

  const loadQuestions = async () => {
    try {
      console.log("Loading questions...")
      setQuestionsLoading(true)
      const response = await fetch('http://localhost:8000/api/v1/questions/')
      const data = await response.json()
      console.log("Questions loaded:", data)
      setQuestions(data)
    } catch (error) {
      console.log("Error details:", error)
      console.log("Error message:", error.message)
      console.log("Error stack:", error.stack)
      console.error('Failed to load questions:', error)
    } finally {
      setQuestionsLoading(false)
    }
  }

  const loadSubmissions = async () => {
    if (!accessToken) return
    
    try {
      setSubmissionsLoading(true)
      const response = await fetch('http://localhost:8000/api/v1/submissions/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Submissions loaded:", data)
        setSubmissions(data)
      } else {
        console.error('Failed to load submissions:', response.status)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Attempting login...")
      setLoginError('')
      
      // Try login first (since user might already exist)
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      
      const loginResponse = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })
      
      if (loginResponse.ok) {
        const loginData: AuthResponse = await loginResponse.json()
        console.log("Login successful:", loginData)
        setAccessToken(loginData.access_token)
        setUser({ id: 1, email: email, is_active: true }) // Simple user object
        localStorage.setItem('access_token', loginData.access_token)
        setIsLoggedIn(true)
        loadQuestions()
        loadSubmissions()
        return
      }

      // If login fails, try to register
      console.log("Login failed, trying registration...")
      const registerResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      
      if (registerResponse.ok) {
        const registerData: AuthResponse = await registerResponse.json()
        console.log("Registration successful:", registerData)
        setAccessToken(registerData.access_token)
        setUser(registerData.user || { id: 1, email: email, is_active: true })
        localStorage.setItem('access_token', registerData.access_token)
        setIsLoggedIn(true)
        loadQuestions()
        loadSubmissions()
      } else {
        setLoginError('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setAccessToken(null)
    setUser(null)
    setIsLoggedIn(false)
    setQuestions([])
    setCurrentIndex(0)
    setUserAnswer('')
    setShowAnswer(false)
    setAnsweredQuestions(new Set())
    setSubmissions([])
  }

  const submitAnswer = async (questionId: number, userAnswer: string) => {
    if (!accessToken) {
      console.error('No access token available')
      return
    }

    try {
      const submissionData: SubmissionData = {
        question_id: questionId,
        user_answer: userAnswer,
        time_spent: 0 // You can implement timing logic if needed
      }

      console.log("Submitting answer:", submissionData)
      
      const response = await fetch('http://localhost:8000/api/v1/submissions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Answer submitted successfully:", result)
        // Reload submissions to show the new one
        loadSubmissions()
        return result
      } else {
        console.error('Failed to submit answer:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion || answeredQuestions.has(currentQuestion.id)) return

    try {
      // Submit to backend
      await submitAnswer(currentQuestion.id, userAnswer)
      
      const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]))
      setShowAnswer(true)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      // Still show the answer locally even if submission fails
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]))
      setShowAnswer(true)
    }
  }

  const getQuestionById = (questionId: number) => {
    return questions.find(q => q.id === questionId)
  }

  const getCorrectRate = () => {
    if (submissions.length === 0) return 0
    const correct = submissions.filter(s => s.is_correct).length
    return Math.round((correct / submissions.length) * 100)
  }

  const getTopicStats = () => {
    const topicStats: { [key: string]: { total: number; correct: number; rate: number } } = {}
    
    submissions.forEach(submission => {
      const question = getQuestionById(submission.question_id)
      if (question) {
        const topic = question.topic
        if (!topicStats[topic]) {
          topicStats[topic] = { total: 0, correct: 0, rate: 0 }
        }
        topicStats[topic].total++
        if (submission.is_correct) {
          topicStats[topic].correct++
        }
      }
    })

    // Calculate rates
    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic]
      stats.rate = Math.round((stats.correct / stats.total) * 100)
    })

    return topicStats
  }

  const getDailyStats = () => {
    const dailyStats: { [key: string]: { total: number; correct: number; rate: number } } = {}
    
    submissions.forEach(submission => {
      const date = new Date(submission.created_at).toLocaleDateString()
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, correct: 0, rate: 0 }
      }
      dailyStats[date].total++
      if (submission.is_correct) {
        dailyStats[date].correct++
      }
    })

    // Calculate rates
    Object.keys(dailyStats).forEach(date => {
      const stats = dailyStats[date]
      stats.rate = Math.round((stats.correct / stats.total) * 100)
    })

    return dailyStats
  }

  const getWrongQuestions = () => {
    return submissions.filter(s => !s.is_correct)
  }

  const jumpToQuestion = (questionId: number) => {
    const questionIndex = questions.findIndex(q => q.id === questionId)
    if (questionIndex !== -1) {
      setCurrentIndex(questionIndex)
      setCurrentView('practice')
      setUserAnswer('')
      setShowAnswer(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Question ID', 'Topic', 'Question', 'Your Answer', 'Correct Answer', 'Status', 'Date'],
      ...submissions.map(submission => {
        const question = getQuestionById(submission.question_id)
        return [
          submission.question_id,
          question?.topic || 'Unknown',
          question?.stem || 'Unknown',
          submission.user_answer,
          question?.answer || 'Unknown',
          submission.is_correct ? 'Correct' : 'Incorrect',
          new Date(submission.created_at).toLocaleString()
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sat-practice-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // Simple PDF export using window.print()
    window.print()
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (showOnlyWrong && submission.is_correct) return false
    if (selectedTopic !== 'all') {
      const question = getQuestionById(submission.question_id)
      return question?.topic === selectedTopic
    }
    return true
  })

  const topicStats = getTopicStats()
  const dailyStats = getDailyStats()
  const wrongQuestions = getWrongQuestions()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              SAT AI Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter any email and password to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-600 text-sm text-center">{loginError}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">Loading questions...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">No questions available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">SAT Math Practice</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('practice')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'practice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setCurrentView('submissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Submissions ({submissions.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Practice View */}
        {currentView === 'practice' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="capitalize font-medium">{currentQuestion.topic}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-medium text-gray-800 leading-relaxed mb-4">
                {currentQuestion.stem}
              </p>

              {currentQuestion.type === 'mcq' ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-gray-50 transition-colors border">
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={userAnswer === option}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={showAnswer}
                        className="text-blue-500 w-4 h-4"
                      />
                      <span className="text-base">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  disabled={showAnswer}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {showAnswer && (
                <div className={`mt-4 p-4 rounded-md text-base font-medium ${
                  userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() 
                    ? '✓ Correct!' 
                    : `✗ Incorrect. Answer: ${currentQuestion.answer}`
                  }
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1)
                    setUserAnswer('')
                    setShowAnswer(false)
                  }
                }}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-base bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Previous
              </button>

              {!showAnswer ? (
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-2 text-base bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors font-medium"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(currentIndex + 1)
                      setUserAnswer('')
                      setShowAnswer(false)
                    }
                  }}
                  disabled={currentIndex === questions.length - 1}
                  className="px-6 py-2 text-base bg-green-500 text-white rounded-md disabled:opacity-50 hover:bg-green-600 transition-colors font-medium"
                >
                  {currentIndex === questions.length - 1 ? 'Finished' : 'Next'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submissions View */}
        {currentView === 'submissions' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
              
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                  <div className="text-sm text-blue-800">Total Questions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.is_correct).length}
                  </div>
                  <div className="text-sm text-green-800">Correct Answers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{getCorrectRate()}%</div>
                  <div className="text-sm text-purple-800">Accuracy Rate</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{wrongQuestions.length}</div>
                  <div className="text-sm text-red-800">Wrong Answers</div>
                </div>
              </div>

              {/* Topic Stats */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Topic</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(topicStats).map(([topic, stats]) => (
                    <div key={topic} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 capitalize">{topic}</span>
                        <span className="text-sm text-gray-500">{stats.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.rate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.correct}/{stats.total} correct
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Trend */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance Trend</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex space-x-4 overflow-x-auto">
                    {Object.entries(dailyStats).map(([date, stats]) => (
                      <div key={date} className="flex-shrink-0 text-center">
                        <div className="text-sm text-gray-600 mb-1">{date}</div>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{stats.rate}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.correct}/{stats.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOnlyWrong}
                      onChange={(e) => setShowOnlyWrong(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show only wrong answers</span>
                  </label>
                  
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Topics</option>
                    {Object.keys(topicStats).map(topic => (
                      <option key={topic} value={topic} className="capitalize">{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              {submissionsLoading ? (
                <div className="text-center text-gray-500 py-8">Loading submissions...</div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No submissions found with current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Your Answer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correct Answer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubmissions.map((submission) => {
                        const question = getQuestionById(submission.question_id)
                        return (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                submission.is_correct 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {submission.is_correct ? '✅ Correct' : '❌ Incorrect'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {question?.stem || 'Unknown question'}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {question?.topic || 'Unknown topic'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {submission.user_answer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {question?.answer || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(submission.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {!submission.is_correct && (
                                <button
                                  onClick={() => jumpToQuestion(submission.question_id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Try Again
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
