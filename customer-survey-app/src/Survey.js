import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Survey.css';
import logo from './logo22.png'; // Import the logo image

const Survey = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [responses, setResponses] = useState([]);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [timer, setTimer] = useState(5); // Countdown timer for UI

  useEffect(() => {
    // Fetch questions from the database when the component mounts
    axios.get('http://localhost:5000/api/questions')
      .then(response => {
        setQuestions(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Start countdown timer when submission message is displayed
    if (submissionMessage) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      // Clear interval when timer reaches 0
      if (timer === 0) {
        clearInterval(interval);
      }
      // Reset timer and submission message after 5 seconds
      if (timer === 0) {
        setTimeout(() => {
          setSubmissionMessage('');
          setTimer(5);
          setShowWelcome(true);
        }, 5000);
      }
      // Clear interval on component unmount
      return () => clearInterval(interval);
    }
  }, [timer, submissionMessage]);

  const handleStart = () => {
    setShowWelcome(false); // Hide welcome message and start button
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit responses to the database
      axios.post('http://localhost:5000/api/submit', { responses })
        .then(response => {
          setSubmissionMessage('Thank you for your feedback! Your response has been successfully submitted.');
          setResponses([]); // Reset responses
          setCurrentQuestionIndex(0); // Reset question index
        })
        .catch(error => {
          console.error('Error submitting responses:', error);
        });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswer = (answer) => {
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = answer;
    setResponses(updatedResponses);

    // Check if it's the 4th question and apply color only when a button is clicked
    if (currentQuestionIndex === 3) {
      const color = getRatingColor(answer);
      const buttons = document.querySelectorAll('.response-button');
      buttons.forEach(button => {
        const rating = parseInt(button.textContent);
        if (rating === answer) {
          button.classList.add('selected');
          button.style.backgroundColor = color;
        } else {
          button.classList.remove('selected');
          button.style.backgroundColor = '';
        }
      });
    }
  };

  const renderQuestion = (question) => {
    switch (currentQuestionIndex) {
      case 0:
      case 1:
      case 2:
        return (
          <div className="question">
            <h2>{question.text} (Rating type, 1-5)</h2>
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                className={`response-button ${responses[currentQuestionIndex] === rating ? `selected rating-${rating}` : ''}`}
                onClick={() => handleAnswer(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="question">
            <h2>{question.text} (Rating type, 1-10)</h2>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
              <button
                key={rating}
                className={`response-button ${responses[currentQuestionIndex] === rating ? `selected rating-${rating}` : ''}`}
                onClick={() => handleAnswer(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="question">
            <h2>{question.text} (Text type)</h2>
            <input type="text" className="text-response" onChange={(e) => handleAnswer(e.target.value)} />
          </div>
        );
      default:
        return null;
    }
  };

  const getRatingColor = (rating) => {
    // Specify colors based on rating value
    switch (rating) {
      case 1:
        return '#FF0000'; // Red
      case 2:
        return '#FF4500'; // Dark Orange
      case 3:
        return '#FFA500'; // Orange
      case 4:
        return '#FFD700'; // Gold
      case 5:
        return '#FFFF00'; // Yellow
      case 6:
        return '#00FF00'; // Lime
      case 7:
        return '#32CD32'; // Lime Green
      case 8:
        return '#008000'; // Green
      case 9:
        return '#3CB371'; // Medium Sea Green
      case 10:
        return '#228B22'; // Forest Green
      default:
        return 'transparent';
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="survey-container">
      {!submissionMessage && (
        <>
          {showWelcome && (
            <div className="welcome-message">
              <h1>Welcome to the Survey</h1>
              <button onClick={handleStart} className="start-button">Start</button>
            </div>
          )}
          {!showWelcome && (
            <>
              {isLoading && <p>Loading...</p>}
              {!isLoading && questions.length > 0 && currentQuestionIndex < questions.length && (
                <div>
                  <h2>Question {currentQuestionIndex + 1}/{questions.length > 0 ? questions.length : 'Loading...'}</h2>
                  {renderQuestion(questions[currentQuestionIndex])}
                  {/* Render navigation buttons */}
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={handlePreviousQuestion} className="navigation-button" disabled={currentQuestionIndex === 0}>Previous</button>
                    {!isLastQuestion && <button onClick={handleNextQuestion} className="navigation-button" disabled={currentQuestionIndex === questions.length - 1}>Next</button>}
                    {isLastQuestion && <button className="submit-button" onClick={handleNextQuestion}>Submit</button>}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      {submissionMessage && (
        <div className="submission-message">
          {submissionMessage}
          <img src={logo} alt="Logo" className="logo" /> {/* Display the logo */}
          <p>Restarting in {timer} seconds...</p>
        </div>
      )}
    </div>
  );

};

export default Survey;
