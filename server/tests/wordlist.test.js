const wordLists = require('../wordlists/wordlist');

describe('Word Lists', () => {
  test('should export easy, medium and hard word lists', () => {
    expect(wordLists).toHaveProperty('easyWords');
    expect(wordLists).toHaveProperty('mediumWords');
    expect(wordLists).toHaveProperty('hardWords');
  });

  test('easyWords should be an array of strings', () => {
    expect(Array.isArray(wordLists.easyWords)).toBe(true);
    expect(wordLists.easyWords.length).toBeGreaterThan(0);
    wordLists.easyWords.forEach(word => {
      expect(typeof word).toBe('string');
    });
  });

  test('mediumWords should be an array of strings', () => {
    expect(Array.isArray(wordLists.mediumWords)).toBe(true);
    expect(wordLists.mediumWords.length).toBeGreaterThan(0);
    wordLists.mediumWords.forEach(word => {
      expect(typeof word).toBe('string');
    });
  });

  test('hardWords should be an array of strings', () => {
    expect(Array.isArray(wordLists.hardWords)).toBe(true);
    expect(wordLists.hardWords.length).toBeGreaterThan(0);
    wordLists.hardWords.forEach(word => {
      expect(typeof word).toBe('string');
    });
  });

  test('should have correctly categorized words by length', () => {
    // Sample check - easy words should generally be shorter than hard words
    const avgEasyLength = wordLists.easyWords.reduce((sum, word) => sum + word.length, 0) / wordLists.easyWords.length;
    const avgHardLength = wordLists.hardWords.reduce((sum, word) => sum + word.length, 0) / wordLists.hardWords.length;
    
    expect(avgEasyLength).toBeLessThan(avgHardLength);
  });
});
