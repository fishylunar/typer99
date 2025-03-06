const easyWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", 
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "gay"
];

const mediumWords = [
  "about", "above", "actually", "after", "again", "against", "among", "another", "appear", "around",
  "because", "become", "before", "behind", "being", "believe", "beside", "between", "beyond", "both",
  "consider", "continue", "country", "create", "defeat", "defend", "define", "degree", "demand", "describe",
  "develop", "difference", "different", "difficult", "direction", "discover", "discuss", "during", "early", "economy",
  "education", "effect", "effort", "either", "energy", "enough", "especially", "establish", "evening", "every",
  "example", "except", "experience", "explain", "express", "factor", "follow", "former", "forward", "future",
  "general", "government", "great", "ground", "growth", "happen", "health", "history", "however", "hundred",
  "identify", "imagine", "important", "improve", "include", "increase", "indeed", "indicate", "individual", "industry",
  "instead", "interest", "involve", "issue", "itself", "knowledge", "language", "large", "later", "learn", "furry"
];

const hardWords = [
  "abbreviation", "accommodation", "acknowledgement", "administrative", "aeronautical", "algorithm", "ambiguity", "amplitude", "anthropology", "antidisestablishmentarianism",
  "biochemistry", "bureaucracy", "catastrophe", "chronological", "civilization", "collaboration", "colonization", "commercialization", "comprehensive", "conceptualization",
  "configuration", "consciousness", "consequence", "considerable", "constitution", "controversial", "correspondence", "cryptocurrency", "crystallization", "demonstration",
  "determination", "differentiating", "disestablishment", "disproportionate", "documentation", "economics", "electromagnetism", "entrepreneurship", "environmentalism", "epitome",
  "epistemology", "equilibrium", "establishment", "exacerbate", "extraordinary", "extrapolation", "floccinaucinihilipilification", "fundamentalism", "generalization", "heterogeneous",
  "hyperbole", "idiosyncrasy", "inconsequential", "indispensable", "infrastructure", "international", "interpretation", "interrelationship", "irreconcilable", "juxtaposition",
  "knowledgeable", "lexicography", "logarithmic", "manifestation", "mathematical", "miscellaneous", "misrepresentation", "monarchy", "neuroscience", "nevertheless",
  "nomenclature", "notwithstanding", "onomatopoeia", "organizational", "paleontology", "parliamentary", "perpendicular", "personification", "pharmaceutical", "phenomenology",
  "philosophical", "photosynthesis", "precipitation", "prerogative", "prestidigitation", "proportional", "psychological", "qualification", "quintessential", "recognition",
  "recommendation", "reconciliation", "rehabilitation", "representation", "retrospective", "scientifically", "socioeconomic", "sophisticated", "substantiate", "synchronization"
];

module.exports = {
  easyWords,
  mediumWords,
  hardWords
};
