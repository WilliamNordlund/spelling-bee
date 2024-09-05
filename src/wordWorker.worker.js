/* eslint-disable no-restricted-globals */

self.onmessage = function () {
    console.log('Worker started fetching the word list...');
    fetch(`${process.env.PUBLIC_URL}/swedish_words.txt`)
      .then((response) => {
        console.log('Fetched the word list');
        return response.text();
      })
      .then((data) => {
        const wordArray = data.split('\n').map((word) => word.trim().toLowerCase());
        console.log('Word list processed, sending data back...');
        self.postMessage(wordArray); // Send back the processed word list
      })
      .catch((error) => {
        console.error('Error fetching the word list:', error);
        self.postMessage([]); // Send an empty list if there's an error
      });
  };
  