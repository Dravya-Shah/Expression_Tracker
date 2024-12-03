import React, { useState, useEffect } from 'react';
import './GameComponent.css';
import ImageCapture from '../ImageCaptureComponent';

const shapes = ['circle', 'square', 'triangle'];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function GameComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shuffledOptions, setShuffledOptions]  = useState([]);
  const [streak, setStreak] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const username = localStorage.getItem('username');

  const startSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/start-session?username=${username}`);
      const data = await response.json();
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    const newQuestions = Array(5)
      .fill(null)
      .map(() => {
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const randomCount = Math.floor(Math.random() * 5) + 1;
        const sequence = Array(randomCount)
          .fill(randomShape)
          .concat(
            Array(9 - randomCount).fill(null).map(() => 
              shapes[Math.floor(Math.random() * shapes.length)])
          );

        const correctAnswer = sequence.filter((s) => s === randomShape).length;
        let options = [correctAnswer];
        while (options.length < 4) {
          const randomOption = Math.floor(Math.random() * 5) + 1;
          if (!options.includes(randomOption)) {
            options.push(randomOption);
          }
        }

        return {
          shape: randomShape,
          sequence,
          correctAnswer,
          options: shuffleArray([...options])
        };
      });
    setQuestions(newQuestions);
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      setShuffledOptions(questions[currentQuestion].options);
    }
  }, [currentQuestion, questions]);

  const handleAnswer = async (answer) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setIsAnswered(true);

      const correctAnswer = questions[currentQuestion].correctAnswer;
      const correct = answer === correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setScore(score + 1);
        setStreak(streak + 1);
      } else {
        setStreak(0);
      }
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      //endSession();
      setIsGameActive(false);
    }
  };

  // const endSession = async () => {
  //   try {
  //     await fetch(`http://localhost:5000/end-session`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         sessionId,
  //         username,
  //         score,
  //         totalQuestions: questions.length
  //       }),
  //     });
  //   } catch (error) {
  //     console.error('Error ending session:', error);
  //   }
  // };

  const restartGame = async () => {
    await startSession();
    setScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setStreak(0);
    setIsGameActive(true);
    
    const newQuestions = Array(5)
      .fill(null)
      .map(() => {
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const randomCount = Math.floor(Math.random() * 5) + 1;
        const sequence = Array(randomCount)
          .fill(randomShape)
          .concat(
            Array(9 - randomCount).fill(null).map(() => 
              shapes[Math.floor(Math.random() * shapes.length)])
          );

        const correctAnswer = sequence.filter((s) => s === randomShape).length;
        let options = [correctAnswer];
        while (options.length < 4) {
          const randomOption = Math.floor(Math.random() * 5) + 1;
          if (!options.includes(randomOption)) {
            options.push(randomOption);
          }
        }

        return {
          shape: randomShape,
          sequence,
          correctAnswer,
          options: shuffleArray([...options])
        };
      });
    setQuestions(newQuestions);
  };

  const getSmiley = () => {
    if (!isAnswered) return '😊';
    if (isCorrect) return streak > 1 ? '😁' : '😃';
    return '😢';
  };

  if (questions.length === 0) return <div>Loading...</div>;

  if (!isGameActive) {
    return (
      <div className="app">
        <h1 className="game-title">Shape Counting Game</h1>
        <div className="game-container">
          <p className="result">Your score: {score} / {questions.length}</p>
          <button
            className="restart-btn"
            onClick={restartGame}
            aria-label="Play Again"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const { shape, sequence, options } = questions[currentQuestion];

  return (
    <div className="app">
      {isGameActive && sessionId && (
        <ImageCapture 
          sessionId={sessionId} 
          isActive={isGameActive} 
          
        />
      )}
      <h1 className="game-title">Shape Counting Game</h1>
      <div className="game-container">
        <h3>How many <span className="target-shape">{shape}s</span> are in the sequence?</h3>
        <div className="shape-sequence">
          {sequence.map((s, index) => (
            <div 
              key={index} 
              className={`shape ${s} ${isCorrect === false ? 'sad' : ''}`}
              aria-label={`A ${s}`}
            >
              {s && <span className="smiley">{getSmiley()}</span>}
            </div>
          ))}
        </div>
        <div className="options-container">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                isAnswered
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'correct'
                    : option === selectedAnswer
                    ? 'incorrect'
                    : ''
                  : ''
              }`}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              aria-label={`Select ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedAnswer !== null && (
          <div>
            <p className="result">
              {isCorrect 
                ? 'Correct!' 
                : `Wrong! The correct answer was ${questions[currentQuestion].correctAnswer}.`}
            </p>
            <button
              className="next-btn"
              onClick={nextQuestion}
              aria-label="Next Question"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameComponent;