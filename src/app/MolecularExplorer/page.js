'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './MolecularExplorer.module.css'

export default function CompoundSearch() {
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
    const savedHistory = localStorage.getItem('compoundSearchHistory')
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

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setCompound(value)
    
    // Reset result when user starts typing a new search
    if (result && value !== compound) {
      setResult(null)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setCompound(suggestion)
    setSuggestions([])
    searchCompound(suggestion) // Auto-search when suggestion is clicked
  }

  // Add to search history
  const addToSearchHistory = (term) => {
    if (!term.trim()) return
    
    // Create updated history with new term at the beginning and remove duplicates
    const updatedHistory = [term, ...searchHistory.filter(item => item !== term)]
    
    // Limit to 10 items
    const limitedHistory = updatedHistory.slice(0, 10)
    
    // Update state and localStorage
    setSearchHistory(limitedHistory)
    localStorage.setItem('compoundSearchHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setCompound(historyItem)
    searchCompound(historyItem)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('compoundSearchHistory')
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
          searchCompound();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current.blur();
        break;
        
      case 'Tab':
        if (suggestions.length && selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
        
      default:
        break;
    }
  };

  // 🧪 Search selected compound
  const searchCompound = async (compoundName) => {
    const query = compoundName || compound
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setSuggestions([])
    setSelectedIndex(-1)
    setCompound(query)

    try {
      const encodedName = encodeURIComponent(query)
      const cidResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/cids/JSON`)
      if (!cidResponse.ok) throw new Error('Compound not found')
      
      const cidData = await cidResponse.json()
      const cid = cidData.IdentifierList.CID[0]

      const propsResponse = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,ExactMass,MonoisotopicMass,CanonicalSMILES,InChI/JSON`
      )
      if (!propsResponse.ok) throw new Error('Properties not found')

      const propsData = await propsResponse.json()
      const props = propsData.PropertyTable.Properties[0]

      // Add to search history after successful search
      addToSearchHistory(query)

      setResult({
        name: query,
        formula: props.MolecularFormula,
        smiles: props.CanonicalSMILES,
        inchi: props.InChI,
        molecular_weight: props.MolecularWeight,
        exact_mass: props.ExactMass,
        monoisotopic_mass: props.MonoisotopicMass,
        image_2d: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`,
        image_3d_ball_stick: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_type=3d`,
        image_3d_space: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_type=3d&style=space`,
        image_3d_sticks: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_type=3d&style=sticks`,
        image_3d_wire: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_type=3d&style=wire`,
        cid: cid.toString()
      })
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Chemical Compound</h1>
        
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
            onClick={() => searchCompound()}
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
            <div className={styles.compoundHeader}>
              <h2>{result.name}</h2>
              <span className={styles.cid}>CID: {result.cid}</span>
            </div>

            <div className={styles.grid}>
              <div className={styles.card}>
                <h3>Basic Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><span>Formula:</span><span>{result.formula}</span></div>
                  <div className={styles.infoItem}><span>Molecular Weight:</span><span>{result.molecular_weight}</span></div>
                  <div className={styles.infoItem}><span>Exact Mass:</span><span>{result.exact_mass}</span></div>
                  <div className={styles.infoItem}><span>Monoisotopic Mass:</span><span>{result.monoisotopic_mass}</span></div>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Chemical Identifiers</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><span>SMILES:</span><span className={styles.identifier}>{result.smiles}</span></div>
                  <div className={styles.infoItem}><span>InChI:</span><span className={styles.identifier}>{result.inchi}</span></div>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Structure Visualization</h3>
                <div className={styles.structures}>
                  <div className={styles.structureBox}>
                    <h4>2D Structure</h4>
                    <img src={result.image_2d} alt="2D structure" className={styles.structureImage} />
                  </div>
                  <div className={styles.structureBox}>
                    <h4>3D Structure</h4>
                    <iframe
                      src={`https://pubchem.ncbi.nlm.nih.gov/compound/${result.cid}#section=3D-Conformer&embed=true`}
                      className={styles.viewer3D}
                      title="3D Molecule Viewer"
                    />
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
