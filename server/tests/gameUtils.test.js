const { generateText, getRandomWords, calculateWPM } = require('../utils/gameUtils');
const wordLists = require('../wordlists/wordlist');

describe('Game Utils', () => {
  describe('generateText', () => {
    test('should generate text for 1v1 mode', () => {
      const text = generateText('1v1', 2);
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
      expect(text.split(' ').length).toBeGreaterThanOrEqual(20); // At least 20 words
    });

    test('should generate text for free-for-all mode', () => {
      const text = generateText('free-for-all', 4);
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
      expect(text.split(' ').length).toBeGreaterThanOrEqual(20);
    });

    test('should generate text for battle-royale mode', () => {
      const text = generateText('battle-royale', 5);
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
      expect(text.split(' ').length).toBeGreaterThanOrEqual(20);
    });

    test('should generate longer text for more players in battle-royale', () => {
      const textFew = generateText('battle-royale', 3).split(' ').length;
      const textMany = generateText('battle-royale', 10).split(' ').length;
      expect(textMany).toBeGreaterThanOrEqual(textFew);
    });
  });

  describe('getRandomWords', () => {
    test('should return the requested number of words', () => {
      const words = getRandomWords(wordLists.easyWords, 5);
      expect(words).toHaveLength(5);
      words.forEach(word => {
        expect(typeof word).toBe('string');
        expect(wordLists.easyWords).toContain(word);
      });
    });

    test('should return different words on multiple calls', () => {
      const words1 = getRandomWords(wordLists.mediumWords, 30).join(' ');
      const words2 = getRandomWords(wordLists.mediumWords, 30).join(' ');
      expect(words1).not.toEqual(words2); // Very small chance this could fail randomly
    });

    test('should work with empty wordlists', () => {
      const words = getRandomWords([], 3);
      expect(words).toHaveLength(3);
      expect(words).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('calculateWPM', () => {
    test('should calculate WPM correctly', () => {
      // 300 characters typed in 60 seconds = 60 WPM (assuming 5 chars per word)
      expect(calculateWPM(300, 60)).toBe(60);
      
      // 500 characters typed in 120 seconds = 50 WPM
      expect(calculateWPM(500, 120)).toBe(50);
      
      // 100 characters typed in 15 seconds = 80 WPM
      expect(calculateWPM(100, 15)).toBe(80);
    });

    test('should handle zero time correctly', () => {
      // Avoid division by zero
      expect(calculateWPM(100, 0)).toBe(Infinity);
    });
  });
});
