import React from 'react';

interface LetterGridProps {
  letters: string[];
  requiredLetter: string;
  onLetterClick: (letter: string) => void; // Handle letter click
}

const LetterGrid: React.FC<LetterGridProps> = ({ letters, requiredLetter, onLetterClick }) => {
  return (
    <div className="letter-grid">
      {letters.map((letter, index) => (
        <div
          key={index}
          className={`letter ${letter === requiredLetter ? 'central' : ''}`}
          onClick={() => onLetterClick(letter)} // Call onLetterClick when a letter is clicked
        >
          {letter}
        </div>
      ))}
    </div>
  );
};

export default LetterGrid;
