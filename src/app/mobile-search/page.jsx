"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './mobileSearch.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMagnifyingGlass, 
  faArrowLeft, 
  faSpinner, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import Card from '@/components/card/Card';

const MobileSearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchMode, setSearchMode] = useState('suggestions'); // 'suggestions' or 'results'
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Initialize with URL query if exists
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = (searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setResults([]);
        setSuggestions([]);
        setShowResults(false);
        setSearchMode('suggestions');
      }
    }, 300);
  };

  // Perform search API call
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setShowResults(true);

    try {
      // Fetch search results and suggestions in parallel
      const [resultsResponse, suggestionsResponse] = await Promise.all([
        fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal
        }),
        fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&suggestions=true`, {
          signal: controller.signal
        })
      ]);

      if (!resultsResponse.ok) {
        throw new Error('Search failed');
      }

      const [resultsData, suggestionsData] = await Promise.all([
        resultsResponse.json(),
        suggestionsResponse.json()
      ]);

      setResults(resultsData.posts || []);
      setSuggestions(suggestionsData.suggestions || []);
      setSearchMode(resultsData.posts?.length > 0 ? 'results' : 'suggestions');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setResults([]);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    setSearchMode('suggestions');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Go back
  const handleBack = () => {
    router.back();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={handleBack}
          className={styles.backButton}
          aria-label="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.inputContainer}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search blogs..."
              className={styles.searchInput}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            {loading && (
              <div className={styles.loadingIcon}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
            )}
          </div>
        </form>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {loading && !query && (
          <div className={styles.loadingState}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading...</p>
          </div>
        )}

        {!loading && !query && !showResults && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="3x" className={styles.emptyIcon} />
            <h2>Search blogs</h2>
            <p>Enter a search term to find relevant blog posts</p>
          </div>
        )}

        {showResults && (
          <div className={styles.results}>
            {/* Suggestions */}
            {searchMode === 'suggestions' && suggestions.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Suggestions</h3>
                <div className={styles.suggestionsList}>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.suggestionIcon} />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {searchMode === 'results' && results.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Results for &quot;{query}&quot;
                </h3>
                <div className={styles.resultsList}>
                  {results.map((post, index) => (
                    <Card key={post.id || index} item={post} />
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!loading && query.trim() && results.length === 0 && suggestions.length === 0 && (
              <div className={styles.noResults}>
                <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" className={styles.noResultsIcon} />
                <h3>No results found</h3>
                <p>No results found for &quot;{query}&quot;</p>
                <p>Try searching for something else or check your spelling.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearchPage; 