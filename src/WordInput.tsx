import React from 'react';

interface WordInputProps {
  currentWord: string;
  onWordSubmit: () => void;
  setCurrentWord: (word: string) => void;
}

const WordInput: React.FC<WordInputProps> = ({ currentWord, onWordSubmit, setCurrentWord }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onWordSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={currentWord}
        onChange={(e) => setCurrentWord(e.target.value)} // Allow manual input too
        placeholder="Enter a word"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default WordInput;
