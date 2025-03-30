import { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { generateQuiz } from '../lib/api';

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const response = await generateQuiz();
      const data = response.quiz;
      const openBracketIndex = response.quiz.indexOf('[');
      const closeBracketIndex = response.quiz.lastIndexOf(']', response.quiz.length);
      const jsonMatch = response.quiz.slice(openBracketIndex, closeBracketIndex + 1);
      console.log(jsonMatch);

      // Extract JSON from between ``` markers

      const quizData = JSON.parse(jsonMatch);
      setQuiz(quizData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question['correct option'] ? 1 : 0);
    }, 0);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!quiz) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Quiz</h1>
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded px-4 py-2 text-sm"
                  onClick={() => window.location.href = '/quiz'}
                >
                  Attempt Quiz
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded py-2 px-4 text-sm"
                  onClick={() => window.location.href = '/summary'}
                >
                  View Summary
                </button>
              </div>
            </div>
        {quiz.map((question, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={selectedAnswers[index] === option}
                    onChange={() => handleAnswerSelect(index, option)}
                    disabled={showResults}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{option}</span>
                  {showResults && (
                    <>
                      {option === question['correct option'] && (
                        <span className="ml-2 text-green-500">✓ Correct Answer</span>
                      )}
                      {selectedAnswers[index] === option && option !== question['correct option'] && (
                        <span className="ml-2 text-red-500">✗ Your Answer</span>
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        {!showResults ? (
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
            <p className="text-lg">
              You scored {calculateScore()} out of {quiz.length} questions correctly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;