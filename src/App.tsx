import React, { useState, useEffect } from 'react';
import LetterGrid from './LetterGrid';
import WordInput from './WordInput';
import WordList from './WordList';
import Score from './Score';
import './styles.css'; // Import CSS styles

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
  const [errorMessage, setErrorMessage] = useState<string>(''); // New state for error messages
  const [currentWord, setCurrentWord] = useState<string>(''); // Current word being constructed

  // Load the Swedish word list from the text file (simulated for now)
  useEffect(() => {
    fetch('/swedish_words.txt')
      .then((response) => response.text())
      .then((data) => {
        const wordArray = data.split('\n').map((word) => word.trim().toLowerCase());
        setValidWords(wordArray);
        generateValidLetterSet(wordArray);
      });
  }, []);

  // Function to validate if a word can be submitted
  const isValidWord = (word: string): boolean => {
    const wordLetters = word.toUpperCase().split('');

    // Check if the word has the required middle letter and is at least 3 characters long
    if (!wordLetters.includes(centralLetter)) {
      setErrorMessage('Ditt ord saknar den centrala bokstaven!'); // Missing central letter
      return false;
    }

    if (word.length < 3) {
      setErrorMessage('Ditt ord är för kort, det måste ha minst 3 bokstäver.'); // Too short
      return false;
    }

    // Ensure the word only contains valid letters
    if (!wordLetters.every(letter => letters.includes(letter.toUpperCase()))) {
      setErrorMessage('Ditt ord innehåller bokstäver som inte finns bland de tillåtna.'); // Invalid letters
      return false;
    }

    // Ensure the word is part of the valid Swedish word list
    if (!validWords.includes(word.toLowerCase())) {
      setErrorMessage('Ditt ord finns inte i den svenska ordlistan.'); // Not in word list
      return false;
    }

    // If everything is valid
    setErrorMessage(''); // Clear error message if word is valid
    return true;
  };

  const handleWordSubmit = (): void => {
    if (!submittedWords.includes(currentWord) && isValidWord(currentWord)) {
      setSubmittedWords([...submittedWords, currentWord]);
      setScore(score + currentWord.length); // Score based on word length
      setCurrentWord(''); // Reset current word
    }
  };

  const handleLetterClick = (letter: string) => {
    setCurrentWord((prevWord) => prevWord + letter);
  };

  // Shuffle letters while keeping the central letter in the middle
  const shuffleLetters = () => {
    // Remove the central letter from the letters list before shuffling
    const shuffledLetters = letters.filter(l => l !== centralLetter);
    shuffledLetters.sort(() => Math.random() - 0.5); // Shuffle the letters
    const newLetters = [...shuffledLetters.slice(0, 3), centralLetter, ...shuffledLetters.slice(3)]; // Keep central letter in the middle
    setLetters(newLetters);
  };

  // Reset the current input word
  const resetWordInput = () => {
    setCurrentWord('');
  };

  // Generate a set of letters that can form at least 15 valid words
  const generateValidLetterSet = (wordArray: string[]) => {
    let possibleLetters: WordSet | null = null;

    // Loop until we find a valid set of letters
    while (!possibleLetters) {
      const randomLetters = generateRandomLetters();
      const centralLetter = randomLetters[Math.floor(Math.random() * randomLetters.length)];

      // Filter words that can be made with the random letters
      const validWordsForSet = wordArray.filter((word) => {
        const wordLetters = word.toUpperCase().split('');
        return (
          word.length >= 3 &&
          wordLetters.includes(centralLetter) &&
          wordLetters.every((letter) => randomLetters.includes(letter))
        );
      });

      if (validWordsForSet.length >= MIN_WORDS) {
        // Filter the central letter out before setting the letters array
        setLetters([...randomLetters.filter(l => l !== centralLetter).slice(0, 3), centralLetter, ...randomLetters.filter(l => l !== centralLetter).slice(3)]); 
        setCentralLetter(centralLetter);
        possibleLetters = { letters: randomLetters, centralLetter };
      }
    }
  };

  // Generate random letters
  const generateRandomLetters = (): string[] => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split(''); // Include Swedish letters
    const randomLetters = new Set<string>();

    while (randomLetters.size < 7) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      randomLetters.add(randomLetter);
    }

    return Array.from(randomLetters);
  };

  return (
    <div className="container">
      <h1>Spelling Bee - Svenska</h1>
      {letters.length > 0 && (
        <>
          <LetterGrid letters={letters} requiredLetter={centralLetter} onLetterClick={handleLetterClick} />
          <WordInput currentWord={currentWord} onWordSubmit={handleWordSubmit} setCurrentWord={setCurrentWord} />
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
          <div className="controls">
            <button onClick={shuffleLetters}>Blanda bokstäver</button> {/* Shuffle letters button */}
            <button onClick={resetWordInput}>Återställ ord</button> {/* Reset word input button */}
          </div>
          <Score score={score} />
          <WordList words={submittedWords} />
        </>
      )}
    </div>
  );
}

export default App;
