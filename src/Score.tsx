import React from 'react';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div>
      <h3>Score: {score}</h3>
    </div>
  );
};

export default Score;
