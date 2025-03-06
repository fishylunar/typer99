// Convert existing word arrays into a structured format with metadata
const wordlists = {
  standard: {
    name: "Standard",
    description: "Common English words of varying difficulty",
    nsfw: false,
    eligibleForXP: true,
    words: {
      easy: [
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
        "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", 
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see", "other"
      ],
      medium: [
        "about", "above", "actually", "after", "again", "against", "among", "another", "appear", "around",
        "because", "become", "before", "behind", "being", "believe", "beside", "between", "beyond", "both",
        "consider", "continue", "country", "create", "defeat", "defend", "define", "degree", "demand", "describe",
        "develop", "difference", "different", "difficult", "direction", "discover", "discuss", "during", "early", "economy",
        "education", "effect", "effort", "either", "energy", "enough", "especially", "establish", "evening", "every",
        "example", "except", "experience", "explain", "express", "factor", "follow", "former", "forward", "future",
        "general", "government", "great", "ground", "growth", "happen", "health", "history", "however", "hundred",
        "identify", "imagine", "important", "improve", "include", "increase", "indeed", "indicate", "individual", "industry",
        "instead", "interest", "involve", "issue", "itself", "knowledge", "language", "large", "later", "learn"
      ],
      hard: [
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
      ]
    }
  },
  furry: {
    name: "Furry",
    description: "Furry fandom terms and expressions",
    nsfw: true,
    eligibleForXP: false,
    words: {
      easy: [
        "owo", "uwu", "rawr", "nyah", "mewo", "paws", "tail", "ears", "maws", "fluff", 
        "cute", "fur", "snep", "boops", "blep", "snoot", "mlem", "beans", "yeen", "sergal", 
        "beans", "folf", "toony", "snoot", "bap", "happ", "wuff", "awoo", "hewwo", "murr",
        "yiff", "paws", "derg", "sona", "prowl", "rubs", "mane", "howl", "yips", "purr"
      ],
      medium: [
        "fursuit", "murrsuit", "protogen", "fursona", "commissions", "knot", "anthro", "protobean", 
        "convention", "furaffinity", "telegram", "dutch_angel_dragon", "sparkledog", "wickerbeast", 
        "kemono", "popufur", "hyena", "dragon", "synth", "musky", "husky", "floofing", "scritches", 
        "floofer", "canine", "feline", "hybrid", "snuggle", "cuddles", "grooming", 
        "foxes", "wolves", "fennec", "primagen", "skull_suit", "avali", "yinglet", "kobold", 
        "sergals", "talldeer", "ratteguhn", "prancing", "fursuit_friday", "artist", "adopts"
      ],
      hard: [
        "anthropomorphic", "zoomorphic", "digitigrade", "plantigrade", "therian", "otherkin", 
        "conbadges", "fursuiters", "commissioning", "reference_sheet", "anthropomorphism", 
        "conventions", "community", "headless_lounge", "mascots", "partial_suit", "full_suit", 
        "quadsuit", "fursuit_handler", "dealerships", "thought_to_be_extinct", "superiority", 
        "sergal_wedge", "protogen_primagen", "ungroundable", "gearheads", "spirituality", 
        "therianthropy", "feathersona", "scalesona", "fursecution", "designers", "furriness", 
        "fursuiting", "rehabilitation", "imagination", "astrophysics", "manifestation", 
        "quintessential", "phenomenology", "fluffy", "unconventional", "technological", 
        "diversification", "characterization", "personification", "artwork", "adornments"
      ]
    }
  }
};

// For backward compatibility - export the individual word arrays and add a wordlists object
const easyWords = wordlists.standard.words.easy;
const mediumWords = wordlists.standard.words.medium;
const hardWords = wordlists.standard.words.hard;

module.exports = {
  easyWords,
  mediumWords,
  hardWords,
  wordlists
};
