import React, { useState, useEffect } from 'react';
import { submissionsAPI, Submission } from './api';

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionsAPI.getSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getScore = () => {
    const correct = submissions.filter(s => s.is_correct).length;
    return { correct, total: submissions.length, percentage: submissions.length > 0 ? Math.round((correct / submissions.length) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-center">{error}</div>
        <button 
          onClick={loadSubmissions}
          className="mt-4 mx-auto block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const score = getScore();

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Progress</h1>
        
        {/* Score Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{score.percentage}%</div>
            <div className="text-gray-600">
              {score.correct} out of {score.total} questions correct
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          
          {submissions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No submissions yet. Start taking practice questions!
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className={`p-4 border rounded-lg ${
                    submission.is_correct 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Question #{submission.question_id}
                      </div>
                      {submission.question && (
                        <div className="text-sm text-gray-600 mt-1">
                          Topic: {submission.question.topic}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        Your answer: <span className="font-medium">{submission.user_answer}</span>
                      </div>
                      {submission.question && (
                        <div className="text-sm text-gray-600">
                          Correct answer: <span className="font-medium">{submission.question.answer}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        submission.is_correct
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.is_correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(submission.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
