"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import styles from './searchDropdown.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';

const SearchDropdown = ({ 
  isOpen, 
  onClose, 
  isMobile = false, 
  autoFocus = false, 
  isInline = false, // new prop
  query: externalQuery = '', // for inline
  onSelect, // for inline
  onBlur // for inline
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  // For inline mode, use externalQuery
  useEffect(() => {
    if (isInline) {
      setQuery(externalQuery);
      if (externalQuery.trim()) {
        debouncedSearch(externalQuery);
      } else {
        setResults([]);
        setSuggestions([]);
        setShowResults(false);
      }
    }
  }, [externalQuery, isInline]);

  // Initialize with URL query if exists
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
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
      }
    }, 300);
  }, []);

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
        fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&page=1`, {
          signal: controller.signal
        }),
        fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&suggestions=true`, {
          signal: controller.signal
        })
      ]);

      if (!resultsResponse.ok || !suggestionsResponse.ok) {
        throw new Error('Search failed');
      }

      const [resultsData, suggestionsData] = await Promise.all([
        resultsResponse.json(),
        suggestionsResponse.json()
      ]);

      setResults(resultsData.posts || []);
      setSuggestions(suggestionsData.suggestions || []);
      setSelectedIndex(-1);
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
      navigateToSearch(query);
    }
  };

  // Navigate to search page
  const navigateToSearch = (searchQuery) => {
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults) return;

    const totalItems = suggestions.length + results.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : -1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : totalItems - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            // Selected a suggestion
            const suggestion = suggestions[selectedIndex];
            setQuery(suggestion);
            navigateToSearch(suggestion);
          } else {
            // Selected a result
            const result = results[selectedIndex - suggestions.length];
            router.push(`/posts/${result.slug}`);
            onClose();
          }
        } else {
          // No selection, perform search
          handleSubmit(e);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  // Only render dropdown if open (popup) or if isInline and query is non-empty
  if (!isInline && !isOpen) return null;
  if (isInline && !externalQuery) return null;

  return (
    <div 
      className={`${styles.container} ${isMobile ? styles.mobile : ''}`}
      ref={dropdownRef}
      tabIndex={-1}
      onBlur={isInline ? onBlur : undefined}
      style={isInline ? { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 } : {}}
    >
      {/* Only render input in popup/mobile mode */}
      {!isInline && (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.inputContainer}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search blogs..."
              className={styles.searchInput}
              autoComplete="off"
              autoFocus={autoFocus}
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
      )}
      {/* Dropdown results/suggestions */}
      {(showResults || isInline) && (results.length > 0 || suggestions.length > 0) && (
        <div className={styles.dropdown}>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Suggestions</div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={suggestion}
                  className={`${styles.suggestionItem} ${selectedIndex === idx ? styles.selected : ''}`}
                  onClick={() => {
                    if (isInline && onSelect) onSelect(suggestion);
                    else navigateToSearch(suggestion);
                  }}
                  tabIndex={0}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.suggestionIcon} />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
          {/* Results */}
          {results.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Results</div>
              {results.map((result, idx) => (
                <Link
                  key={result.id || result.slug || idx}
                  href={`/posts/${result.slug}`}
                  className={styles.resultItem}
                  tabIndex={0}
                  onClick={() => {
                    if (isInline && onSelect) onSelect(result.title);
                    if (!isInline && onClose) onClose();
                  }}
                >
                  {result.img && (
                    <div className={styles.resultImage}>
                      <Image src={result.img} alt={result.title} width={60} height={60} className={styles.image} />
                    </div>
                  )}
                  <div className={styles.resultContent}>
                    <div className={styles.resultTitle}>{result.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown; 