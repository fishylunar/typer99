const wordLists = require('../wordlists/wordlist');

/**
 * Generates text for typing challenges based on game mode and player count
 */
function generateText(gameMode, playerCount) {
  const { easyWords, mediumWords, hardWords } = wordLists;
  let words = [];
  let wordCount;
  
  switch (gameMode) {
    case '1v1':
      // Medium difficulty, ~30 words
      wordCount = 30;
      words = getRandomWords(mediumWords, wordCount);
      break;
    
    case 'battle-royale':
      // Mixed difficulty, scales with player count
      wordCount = 20 + Math.min(playerCount * 2, 40);
      words = [
        ...getRandomWords(easyWords, Math.floor(wordCount * 0.3)),
        ...getRandomWords(mediumWords, Math.floor(wordCount * 0.5)),
        ...getRandomWords(hardWords, Math.floor(wordCount * 0.2))
      ];
      // Shuffle the words
      words = shuffleArray(words);
      break;
    
    case 'free-for-all':
    default:
      // Medium difficulty, ~25 words
      wordCount = 25;
      words = getRandomWords(mediumWords, wordCount);
      break;
  }
  
  return words.join(' ');
}

/**
 * Gets random words from the provided word list
 */
function getRandomWords(wordList, count) {
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    result.push(wordList[randomIndex]);
  }
  
  return result;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Calculates words per minute based on characters typed and time elapsed
 */
function calculateWPM(characterCount, timeInSeconds) {
  // Average word length is considered to be 5 characters
  const averageWordLength = 5;
  const minutes = timeInSeconds / 60;
  return Math.round((characterCount / averageWordLength) / minutes);
}

module.exports = {
  generateText,
  getRandomWords,
  calculateWPM
};
