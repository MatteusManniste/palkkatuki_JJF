import './css/Runko.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Laskuri = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [result, setResult] = useState(null);
  const [vastausData, setVastausData] = useState([]);


  const fetchAnswers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/answers');
      if (!response.ok) {
        throw Error('Network response was not ok');
      }
      const data = await response.json();
      setAnswers(data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/questions')
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error('Virhe datan haussa:', error));
    fetchAnswers();
  }, []);

  const handleAnswerSelection = (questionId, answerId, optionText) => {
    setSelectedAnswers((prevSelectedAnswers) => ({
      ...prevSelectedAnswers,
      [questionId]: { answerId, optionText },
    }));
    console.log(`Selected answer for question ${questionId}: ${optionText}`);
  };

  const areAllQuestionsAnswered = () => {
    return Object.keys(selectedAnswers).length === questions.length;
  };

  const constructAndExecuteQuery = () => {
    if (questions.length > 0 && areAllQuestionsAnswered()) {
      const answerTexts = Object.values(selectedAnswers).map(
        (selectedAnswer) => selectedAnswer.optionText
      );
  
      const conditions = questions.map((question, index) => {
        return `kysymys_${index + 1} = '${answerTexts[index]}'`;
      });
  
      const query = `SELECT * FROM matrix WHERE ${conditions.join(" AND ")}`;
  
      axios
      .post('http://localhost:3001/api/matrix/query', { sql: query })
      .then((response) => {
        const resultData = response.data;
    
        const filteredResult = {};
        for (const key in resultData[0]) {
          if (key.startsWith('vastaus_')) {
            filteredResult[key] = resultData[0][key];
          }
        }
    
        setResult(filteredResult);
        console.log("Response from server:", resultData);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  };

  useEffect(() => {
    const allAnswered = areAllQuestionsAnswered();
    setAllQuestionsAnswered(allAnswered);

    if (allAnswered) {
      constructAndExecuteQuery();
    }
  }, [selectedAnswers, questions]);

  const fetchAndLogVastausData = () => {
    // Fetch data from the "Vastaus" API endpoint
    axios.get('http://localhost:3001/api/vastaus')
      .then((response) => {
        // Log the response in the console
        console.log('Response from "Vastaus" API:', response.data);
         // Set the fetched data to the state
        setVastausData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data from "Vastaus" API:', error);
      });
  };
  
  

  useEffect(() => {

    fetchAndLogVastausData();
  }, []);
  const vastausDataObject = vastausData.reduce((acc, item) => {
    acc[item.id] = item.text;
    return acc;
  }, {});
  
  return (
<div className="runko-container">
  <div className="runko-box">
    <form>
      {questions.map((question) => (
        <div key={question.id} className="question">
          <p>{question.text}</p>
          <div className="answer-options">
            {answers
              .filter((answer) => answer.question_id === question.id)
              .map((answer) => (
                <div key={answer.id}>
                  <input
                    type="radio"
                    id={`question_${question.id}_answer_${answer.id}`}
                    name={`question_${question.id}`}
                    value={answer.id}
                    onChange={() => handleAnswerSelection(question.id, answer.id, answer.option_text)}
                  />
                  <label htmlFor={`question_${question.id}_answer_${answer.id}`}>
                    {answer.option_text}
                  </label>
                </div>
              ))}
          </div>
        </div>
      ))}
    </form>
  </div>
  <div className="laskuri-box">
  <h2>Tulos:</h2>
{allQuestionsAnswered && (
  <div className="result">
    {result && (
      <div>
        {Object.entries(result).map(([field, text], index) => {
          if (field.startsWith('vastaus_') && text) {
            const id = field.split('_')[1]; // Extract the ID
            const correspondingText = vastausDataObject[id] || ''; // Look up the text
            return (
              <div key={index} className="result-text">
                {correspondingText && `${correspondingText}: `}
                {text.match(/^\d*\.?\d+$/)
                  ? text.includes('.')
                    ? `${parseFloat(text) * 100}%`
                    : `${text} €`
                  : text}
              </div>
            );
          }
          return null;
        })}
      </div>
    )}
  </div>
)}
</div>
    </div>
  );
};

export default Laskuri;
