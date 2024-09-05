import React, { useState, useEffect, useCallback } from 'react';
import LetterGrid from './LetterGrid';
import WordInput from './WordInput';
import WordList from './WordList';
import Score from './Score';
import './styles.css'; // Import CSS styles
import Worker from 'worker-loader!./wordWorker.worker'; // Import the worker using worker-loader
interface WordSet {
  letters: string[];
  centralLetter: string;
}

const MIN_WORDS = 15;

function App() {
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>([]);
  const [centralLetter, setCentralLetter] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>(''); 
  const [currentWord, setCurrentWord] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(true); // New loading state

  // Load the word list using a Web Worker
  useEffect(() => {
    const worker = new Worker(); // Initialize the Web Worker
    worker.postMessage(''); 

    worker.onmessage = function (e) {
      const wordArray = e.data;
      setValidWords(wordArray);
      generateValidLetterSet(wordArray); 
      setIsLoading(false); 
    };

    return () => {
      worker.terminate(); 
    };
  }, []);

  // Function to validate if a word can be submitted
  const isValidWord = useCallback((word: string): boolean => {
    const wordLetters = word.toUpperCase().split('');

    if (!wordLetters.includes(centralLetter)) {
      setErrorMessage('Ditt ord saknar den centrala bokstaven!'); 
      return false;
    }

    if (word.length < 3) {
      setErrorMessage('Ditt ord är för kort, det måste ha minst 3 bokstäver.'); 
      return false;
    }

    if (!wordLetters.every(letter => letters.includes(letter.toUpperCase()))) {
      setErrorMessage('Ditt ord innehåller bokstäver som inte finns bland de tillåtna.'); 
      return false;
    }

    if (!validWords.includes(word.toLowerCase())) {
      setErrorMessage('Ditt ord finns inte i den svenska ordlistan.'); 
      return false;
    }

    setErrorMessage(''); 
    return true;
  }, [centralLetter, letters, validWords]);

  const handleWordSubmit = useCallback((): void => {
    if (!submittedWords.includes(currentWord) && isValidWord(currentWord)) {
      setSubmittedWords([...submittedWords, currentWord]);
      setScore(score + currentWord.length); 
      setCurrentWord(''); 
    }
  }, [currentWord, submittedWords, isValidWord, score]);

  const handleLetterClick = useCallback((letter: string) => {
    setCurrentWord((prevWord) => prevWord + letter);
  }, []);

  // Shuffle letters while keeping the central letter in the middle
  const shuffleLetters = useCallback(() => {
    const shuffledLetters = letters.filter(l => l !== centralLetter);
    shuffledLetters.sort(() => Math.random() - 0.5); 
    const newLetters = [...shuffledLetters.slice(0, 3), centralLetter, ...shuffledLetters.slice(3)]; 
    setLetters(newLetters);
  }, [letters, centralLetter]);

  const resetWordInput = useCallback(() => {
    setCurrentWord('');
  }, []);

  const generateValidLetterSet = useCallback((wordArray: string[]) => {
    let possibleLetters: WordSet | null = null;

    while (!possibleLetters) {
      const randomLetters = generateRandomLetters();
      const centralLetter = randomLetters[Math.floor(Math.random() * randomLetters.length)];

      const validWordsForSet = wordArray.filter((word) => {
        const wordLetters = word.toUpperCase().split('');
        return (
          word.length >= 3 &&
          wordLetters.includes(centralLetter) &&
          wordLetters.every((letter) => randomLetters.includes(letter))
        );
      });

      if (validWordsForSet.length >= MIN_WORDS) {
        setLetters([...randomLetters.filter(l => l !== centralLetter).slice(0, 3), centralLetter, ...randomLetters.filter(l => l !== centralLetter).slice(3)]); 
        setCentralLetter(centralLetter);
        possibleLetters = { letters: randomLetters, centralLetter };
      }
    }
  }, []);

  const generateRandomLetters = (): string[] => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('');
    const randomLetters = new Set<string>();

    while (randomLetters.size < 7) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      randomLetters.add(randomLetter);
    }

    return Array.from(randomLetters);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h2>Laddar spel...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Spelling Bee - Svenska</h1>
      {letters.length > 0 && (
        <>
          <LetterGrid letters={letters} requiredLetter={centralLetter} onLetterClick={handleLetterClick} />
          <WordInput currentWord={currentWord} onWordSubmit={handleWordSubmit} setCurrentWord={setCurrentWord} />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="controls">
            <button onClick={shuffleLetters}>Blanda bokstäver</button>
            <button onClick={resetWordInput}>Återställ ord</button>
          </div>
          <Score score={score} />
          <WordList words={submittedWords} />
        </>
      )}
    </div>
  );
}

export default App;
