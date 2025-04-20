'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Tabs from '@/components/Tabs';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCompound, setSearchedCompound] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  // 📦 Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${searchTerm}/JSON?limit=10`
        );
        const data = await res.json();
        setSuggestions(data?.dictionary_terms?.compound || []);
        setSelectedIndex(-1); // Reset selection when suggestions change
      } catch (error) {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  // 🧹 Clear result and error on search term change
  useEffect(() => {
    setResult(null);
    setError('');
  }, [searchTerm]);

  // 🔍 Search compound
  const searchCompound = async (compoundName) => {
    const query = compoundName || searchTerm;
    if (!query.trim()) return;

    setLoading(true);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError('');
    setSearchedCompound(query);

    try {
      const encodedName = encodeURIComponent(query);
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`
      );

      if (!response.ok) throw new Error('Compound not found');

      const data = await response.json();
      const properties = data?.PropertyTable?.Properties;

      if (!properties || properties.length === 0) {
        throw new Error('Compound not found');
      }

      setResult(properties[0]);
    } catch (err) {
      setResult(null);
      setError('❌ Compound not found. Please try another name.');
    } finally {
      setLoading(false);
    }
  };

  // 🎮 Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prevIndex => 
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
    // Up arrow
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    }
    // Enter key
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        searchCompound(suggestions[selectedIndex]);
        inputRef.current.blur();
      } else {
        searchCompound();
      }
    }
    // Escape key
    else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
      inputRef.current.blur();
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to Chemora</h1>
          <p>
            Learn about chemical compounds with real-time molecular data. Search any compound name to explore its properties.
          </p>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter compound name (e.g., benzene)"
          className={styles.searchInput}
          aria-label="Search compound"
          aria-autocomplete="list"
          aria-controls={suggestions.length > 0 ? "suggestions-list" : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />

        {/* 🔍 Suggestions */}
        {suggestions.length > 0 && (
          <ul 
            id="suggestions-list" 
            className={styles.suggestionsList} 
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <li
                id={`suggestion-${index}`}
                key={index}
                className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => searchCompound(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => searchCompound()}
          disabled={loading || !searchTerm.trim()}
          className={styles.searchButton}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>

      {/* ✅ Result */}
      {result && (
        <div className={styles.resultContainer}>
          <h3>{searchedCompound}</h3>
          <div className={styles.resultFlex}>
            <div className={styles.resultCard}>
              <strong>Formula</strong>
              <p>{result.MolecularFormula}</p>
            </div>
            <div className={styles.resultCard}>
              <strong>IUPAC Name</strong>
              <p>{result.IUPACName}</p>
            </div>
            <div className={styles.resultCard}>
              <strong>Molecular Weight</strong>
              <p>{result.MolecularWeight}</p>
            </div>
          </div>
        </div>
      )}
      <Tabs />
    </main>
  );
}
