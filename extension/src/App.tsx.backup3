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
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loginError, setLoginError] = useState('')

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setAccessToken(token)
      setIsLoggedIn(true)
      fetchQuestions(token)
    }
  }, [])

  const fetchQuestions = async (token: string) => {
    try {
      const response = await fetch('https://sat-ai-backend-1.onrender.com/api/v1/questions/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
        setQuestionsLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      setQuestionsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    console.log("Attempting login...")
    setLoginError('')
    
    try {
      // Try login first (since user might already exist)
      const loginResponse = await fetch('https://sat-ai-backend-1.onrender.com/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      })

      if (loginResponse.ok) {
        const loginData: AuthResponse = await loginResponse.json()
        console.log("Login successful:", loginData)
        setAccessToken(loginData.access_token)
        setIsLoggedIn(true)
        localStorage.setItem('access_token', loginData.access_token)
        await fetchQuestions(loginData.access_token)
        return
      }

      // If login fails, try to register
      console.log("Login failed, trying registration...")
      const registerResponse = await fetch('https://sat-ai-backend-1.onrender.com/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (registerResponse.ok) {
        const registerData: AuthResponse = await registerResponse.json()
        console.log("Registration successful:", registerData)
        setAccessToken(registerData.access_token)
        setIsLoggedIn(true)
        localStorage.setItem('access_token', registerData.access_token)
        await fetchQuestions(registerData.access_token)
      } else {
        const errorData = await registerResponse.json()
        console.error('Registration failed:', errorData)
        setLoginError('Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed. Please try again.')
    }
  }

  const handleLogout = () => {
    setAccessToken(null)
    setIsLoggedIn(false)
    setQuestions([])
    setSubmissions([])
    setCurrentView('practice')
    setCurrentIndex(0)
    setAnsweredQuestions(new Set())
    localStorage.removeItem('access_token')
  }

  const submitAnswer = async (questionId: number, userAnswer: string, timeSpent?: number) => {
    if (!accessToken) return

    try {
      const response = await fetch('https://sat-ai-backend-1.onrender.com/api/v1/submissions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
          time_spent: timeSpent
        })
      })

      if (response.ok) {
        const submission = await response.json()
        setSubmissions(prev => [submission, ...prev])
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const fetchSubmissions = async () => {
    if (!accessToken) return

    try {
      const response = await fetch('https://sat-ai-backend-1.onrender.com/api/v1/submissions/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) return

    const currentQuestion = questions[currentIndex]
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, userAnswer)
      setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]))
    }
    setShowAnswer(true)
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setShowAnswer(false)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserAnswer('')
      setShowAnswer(false)
    }
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setUserAnswer('')
    setShowAnswer(false)
    setAnsweredQuestions(new Set())
  }

  const getTopicStats = () => {
    const stats: { [key: string]: { correct: number; total: number; accuracy: number } } = {}
    
    submissions.forEach(submission => {
      const question = questions.find(q => q.id === submission.question_id)
      if (question) {
        if (!stats[question.topic]) {
          stats[question.topic] = { correct: 0, total: 0, accuracy: 0 }
        }
        stats[question.topic].total++
        if (submission.is_correct) {
          stats[question.topic].correct++
        }
      }
    })

    Object.keys(stats).forEach(topic => {
      stats[topic].accuracy = stats[topic].total > 0 ? (stats[topic].correct / stats[topic].total) * 100 : 0
    })

    return stats
  }

  const getDailyStats = () => {
    const dailyStats: { [key: string]: { correct: number; total: number; accuracy: number } } = {}
    
    submissions.forEach(submission => {
      const date = new Date(submission.created_at).toDateString()
      if (!dailyStats[date]) {
        dailyStats[date] = { correct: 0, total: 0, accuracy: 0 }
      }
      dailyStats[date].total++
      if (submission.is_correct) {
        dailyStats[date].correct++
      }
    })

    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].accuracy = dailyStats[date].total > 0 ? (dailyStats[date].correct / dailyStats[date].total) * 100 : 0
    })

    return dailyStats
  }

  const getWrongQuestions = () => {
    return submissions.filter(submission => !submission.is_correct)
  }

  const topicStats = getTopicStats()
  const dailyStats = getDailyStats()
  const wrongQuestions = getWrongQuestions()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-6">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              SAT AI Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter any email and password to continue
            </p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SAT AI Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentView('practice')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'practice'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => {
                    setCurrentView('submissions')
                    fetchSubmissions()
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'submissions'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Submissions
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'practice' ? (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
                <div className="text-sm text-gray-500">
                  {answeredQuestions.size} answered
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            {questions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {questions[currentIndex]?.topic}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {questions[currentIndex]?.stem}
                </h3>

                {questions[currentIndex]?.type === 'mcq' && questions[currentIndex]?.options && (
                  <div className="space-y-2">
                    {questions[currentIndex].options.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={userAnswer === option}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {questions[currentIndex]?.type === 'short_answer' && (
                  <div>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                )}

                {showAnswer && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Correct Answer:</strong> {questions[currentIndex]?.answer}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Your Answer:</strong> {userAnswer}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      {userAnswer.toLowerCase() === questions[currentIndex]?.answer.toLowerCase()
                        ? '✅ Correct!'
                        : '❌ Incorrect'}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!userAnswer.trim() || showAnswer}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showAnswer ? 'Answered' : 'Submit Answer'}
                    </button>
                    <button
                      onClick={nextQuestion}
                      disabled={currentIndex === questions.length - 1}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={resetQuiz}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reset Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">T</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                    <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">C</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {submissions.filter(s => s.is_correct).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">A</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Accuracy Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {submissions.length > 0
                        ? Math.round((submissions.filter(s => s.is_correct).length / submissions.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Performance */}
            {Object.keys(topicStats).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Topic</h3>
                <div className="space-y-3">
                  {Object.entries(topicStats).map(([topic, stats]) => (
                    <div key={topic} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{topic}</span>
                          <span className="text-sm text-gray-500">
                            {stats.correct}/{stats.total} ({Math.round(stats.accuracy)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {submissions.slice(0, 10).map((submission) => {
                  const question = questions.find(q => q.id === submission.question_id)
                  return (
                    <div key={submission.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {question?.stem.substring(0, 100)}...
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Topic: {question?.topic} • {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.is_correct
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {submission.is_correct ? '✅ Correct' : '❌ Incorrect'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
