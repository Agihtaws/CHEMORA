'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './ChemProperties.module.css'

export default function ChemicalProperties() {
  const [compound, setCompound] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chemPropsHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 🌟 Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (compound.length < 2) {
        setSuggestions([])
        return
      }

      // Only fetch suggestions if no results are displayed
      if (!result) {
        try {
          const res = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${compound}/JSON?limit=10`
          )
          const data = await res.json()
          setSuggestions(data?.dictionary_terms?.compound || [])
          setSelectedIndex(-1) // Reset selection when suggestions change
        } catch (err) {
          setSuggestions([])
        }
      } else {
        setSuggestions([]) // Clear suggestions when results are shown
      }
    }

    fetchSuggestions()
  }, [compound, result])

  // Add to search history
  const addToSearchHistory = (term) => {
    if (!term.trim()) return
    
    // Create updated history with new term at the beginning and remove duplicates
    const updatedHistory = [term, ...searchHistory.filter(item => item !== term)]
    
    // Limit to 10 items
    const limitedHistory = updatedHistory.slice(0, 10)
    
    // Update state and localStorage
    setSearchHistory(limitedHistory)
    localStorage.setItem('chemPropsHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setCompound(historyItem)
    searchChemicalProperties(historyItem)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('chemPropsHistory')
  }

  // 🧪 Search selected compound
  const searchChemicalProperties = async (selectedCompound) => {
    const query = selectedCompound || compound
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setSuggestions([])
    setSelectedIndex(-1)

    try {
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,XLogP,ExactMass,MonoisotopicMass,TPSA,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount,IsotopeAtomCount,AtomStereoCount,DefinedAtomStereoCount,UndefinedAtomStereoCount,BondStereoCount,DefinedBondStereoCount,UndefinedBondStereoCount,CovalentUnitCount,Volume3D,XStericQuadrupole3D,YStericQuadrupole3D,ZStericQuadrupole3D,FeatureCount3D,FeatureAcceptorCount3D,FeatureDonorCount3D,FeatureAnionCount3D,FeatureCationCount3D,FeatureRingCount3D,FeatureHydrophobeCount3D,ConformerModelRMSD3D,EffectiveRotorCount3D,ConformerCount3D/JSON`
      )
      if (!response.ok) {
        throw new Error('Properties not found')
      }

      const data = await response.json()
      
      // Add to search history after successful search
      addToSearchHistory(query)
      
      setResult(data.PropertyTable.Properties[0])
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setCompound(value)
    
    // Reset result when user starts typing a new search
    if (result && value !== compound) {
      setResult(null)
    }
  }

  // Handle suggestion selection with auto-search
  const handleSuggestionClick = (suggestion) => {
    setCompound(suggestion)
    setSuggestions([])
    searchChemicalProperties(suggestion) // Auto-search when suggestion is clicked
  }

  // 🎮 Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
          inputRef.current.blur();
        } else if (compound.trim()) {
          searchChemicalProperties();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current.blur();
        break;
        
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Chemical Properties</h1>
        
        <div className={styles.searchBox}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={compound}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter compound name (e.g., benzene)"
              className={styles.searchInput}
              aria-label="Search for chemical compound"
              aria-autocomplete="list"
              aria-controls={suggestions.length > 0 ? "suggestions-list" : undefined}
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            />
            
            {/* 🔍 Autocomplete Suggestions */}
            {compound.length >= 2 && suggestions.length > 0 && !result && (
              <ul 
                id="suggestions-list"
                className={styles.suggestionsList}
                role="listbox"
              >
                {suggestions.map((item, idx) => (
                  <li
                    id={`suggestion-${idx}`}
                    key={idx}
                    className={`${styles.suggestionItem} ${idx === selectedIndex ? styles.selected : ''}`}
                    onClick={() => handleSuggestionClick(item)}
                    role="option"
                    aria-selected={idx === selectedIndex}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={() => searchChemicalProperties()}
            disabled={loading || !compound.trim()}
            className={styles.searchButton}
          >
            {loading ? <><span className={styles.spinner}></span>Searching...</> : 'Search'}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className={styles.historyContainer}>
            <div className={styles.historyHeader}>
              <h3>Recent Searches</h3>
              <button 
                onClick={clearSearchHistory}
                className={styles.clearHistoryBtn}
              >
                Clear
              </button>
            </div>
            <ul className={styles.historyList}>
              {searchHistory.map((item, index) => (
                <li 
                  key={index} 
                  className={styles.historyItem}
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.grid}>
              <div className={styles.card}>
                <h3>Basic Properties</h3>
                <div className={styles.propertiesGrid}>
                  <div className={styles.propertyItem}>
                    <span>Molecular Weight:</span>
                    <span>{result.MolecularWeight}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>XLogP:</span>
                    <span>{result.XLogP}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Complexity:</span>
                    <span>{result.Complexity}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Charge:</span>
                    <span>{result.Charge}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Structural Properties</h3>
                <div className={styles.propertiesGrid}>
                  <div className={styles.propertyItem}>
                    <span>H-Bond Donors:</span>
                    <span>{result.HBondDonorCount}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>H-Bond Acceptors:</span>
                    <span>{result.HBondAcceptorCount}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Rotatable Bonds:</span>
                    <span>{result.RotatableBondCount}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Heavy Atoms:</span>
                    <span>{result.HeavyAtomCount}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3>3D Properties</h3>
                <div className={styles.propertiesGrid}>
                  <div className={styles.propertyItem}>
                    <span>Volume 3D:</span>
                    <span>{result.Volume3D}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Feature Count 3D:</span>
                    <span>{result.FeatureCount3D}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Ring Count 3D:</span>
                    <span>{result.FeatureRingCount3D}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Conformer Count 3D:</span>
                    <span>{result.ConformerCount3D}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Mass Properties</h3>
                <div className={styles.propertiesGrid}>
                  <div className={styles.propertyItem}>
                    <span>Exact Mass:</span>
                    <span>{result.ExactMass}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Monoisotopic Mass:</span>
                    <span>{result.MonoisotopicMass}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>TPSA:</span>
                    <span>{result.TPSA}</span>
                  </div>
                  <div className={styles.propertyItem}>
                    <span>Covalent Units:</span>
                    <span>{result.CovalentUnitCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
