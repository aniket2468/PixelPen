/**
 * BM25 Search Algorithm Implementation
 * A probabilistic ranking function used for information retrieval
 */

/**
 * Tokenize text into searchable terms
 * @param {string} text - The text to tokenize
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Calculate term frequency (TF) for a document
 * @param {string[]} tokens - Tokens in the document
 * @param {string} term - The search term
 * @returns {number} Term frequency
 */
function calculateTF(tokens, term) {
  return tokens.filter(token => token === term).length;
}

/**
 * Calculate inverse document frequency (IDF)
 * @param {Array} documents - Array of documents
 * @param {string} term - The search term
 * @returns {number} IDF value
 */
function calculateIDF(documents, term) {
  const documentsContainingTerm = documents.filter(doc => 
    doc.tokens.includes(term)
  ).length;
  
  if (documentsContainingTerm === 0) return 0;
  
  return Math.log((documents.length - documentsContainingTerm + 0.5) / (documentsContainingTerm + 0.5));
}

/**
 * Calculate BM25 score for a document
 * @param {Object} doc - Document object with tokens
 * @param {string[]} queryTerms - Array of query terms
 * @param {Array} allDocuments - All documents for IDF calculation
 * @param {number} k1 - Term frequency saturation parameter (default: 1.2)
 * @param {number} b - Field length normalization parameter (default: 0.75)
 * @returns {number} BM25 score
 */
function calculateBM25Score(doc, queryTerms, allDocuments, k1 = 1.2, b = 0.75) {
  const docLength = doc.tokens.length;
  const avgDocLength = allDocuments.reduce((sum, d) => sum + d.tokens.length, 0) / allDocuments.length;
  
  let score = 0;
  
  for (const term of queryTerms) {
    const tf = calculateTF(doc.tokens, term);
    const idf = calculateIDF(allDocuments, term);
    
    // BM25 formula
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
    
    score += idf * (numerator / denominator);
  }
  
  return score;
}

/**
 * Process documents for BM25 search
 * @param {Array} posts - Array of post objects
 * @returns {Array} Processed documents with tokens
 */
function processDocuments(posts) {
  return posts.map(post => {
    // Combine title, description, and category for search
    const searchText = `${post.title || ''} ${post.desc || ''} ${post.catSlug || ''}`.trim();
    const tokens = tokenize(searchText);
    
    return {
      ...post,
      tokens,
      searchText
    };
  });
}

/**
 * Search posts using BM25 algorithm
 * @param {Array} posts - Array of post objects
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} Sorted search results
 */
export function searchWithBM25(posts, query, options = {}) {
  const {
    k1 = 1.2,
    b = 0.75,
    minScore = 0.1,
    maxResults = 100
  } = options;
  
  if (!query || !posts || posts.length === 0) {
    return [];
  }
  
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) {
    return [];
  }
  
  // Process documents
  const processedDocs = processDocuments(posts);
  
  // Calculate BM25 scores
  const scoredResults = processedDocs.map(doc => {
    const score = calculateBM25Score(doc, queryTerms, processedDocs, k1, b);
    return {
      ...doc,
      score
    };
  });
  
  // Filter by minimum score and sort by score descending
  return scoredResults
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Get search suggestions based on partial query
 * @param {Array} posts - Array of post objects
 * @param {string} partialQuery - Partial search query
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {Array} Search suggestions
 */
export function getSearchSuggestions(posts, partialQuery, maxSuggestions = 5) {
  if (!partialQuery || !posts || posts.length === 0) {
    return [];
  }
  
  const query = partialQuery.toLowerCase().trim();
  const suggestions = new Set();
  
  // Extract potential suggestions from titles and descriptions
  posts.forEach(post => {
    const title = post.title || '';
    const desc = post.desc || '';
    
    // Add title if it contains the query
    if (title.toLowerCase().includes(query)) {
      suggestions.add(title);
    }
    
    // Add words from description that start with the query
    const words = tokenize(desc);
    words.forEach(word => {
      if (word.startsWith(query) && word.length > query.length) {
        suggestions.add(word);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} Text with highlighted terms
 */
export function highlightSearchTerms(text, query) {
  if (!text || !query) return text;
  
  const queryTerms = tokenize(query);
  let highlightedText = text;
  
  queryTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
} 