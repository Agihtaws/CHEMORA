"use client"
import { useState, useEffect, useRef } from 'react'
import styles from './physical.module.css'

export default function PhysicalProperties() {
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
    const savedHistory = localStorage.getItem('physicalPropsHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Fetch suggestions
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
    
    // Reset results when typing a new compound
    if (result && value !== compound) {
      setResult(null)
    }
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
    localStorage.setItem('physicalPropsHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setCompound(historyItem)
    searchPhysicalProperties(historyItem)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('physicalPropsHistory')
  }

  const handleSuggestionClick = (suggestion) => {
    setCompound(suggestion)
    setSuggestions([])
    searchPhysicalProperties(suggestion)
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
          searchPhysicalProperties();
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
  
  // Search for physical properties
  const searchPhysicalProperties = async (selectedCompound) => {
    const query = selectedCompound || compound
    if (!query.trim()) return
  
    setLoading(true)
    setError(null)
    setSuggestions([]) // Clear suggestions
    setSelectedIndex(-1)
  
    try {
      // Fetch CID
      const cidResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON`)
      if (!cidResponse.ok) {
        throw new Error('Compound not found')
      }
  
      const cidData = await cidResponse.json()
      const cid = cidData.IdentifierList.CID[0]
  
      // Fetch properties
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/XML?heading=Experimental+Properties`)
      if (!response.ok) {
        throw new Error('Properties not found')
      }
  
      const data = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(data, "text/xml")
  
      const properties = {
        description: getPropertyValue(xmlDoc, "Physical Description"),
        color: getPropertyValue(xmlDoc, "Color/Form"),
        odor: getPropertyValue(xmlDoc, "Odor"),
        taste: getPropertyValue(xmlDoc, "Taste"),
        boilingPoint: getPropertyValue(xmlDoc, "Boiling Point"),
        meltingPoint: getPropertyValue(xmlDoc, "Melting Point"),
        solubility: getPropertyValue(xmlDoc, "Solubility"),
        density: getPropertyValue(xmlDoc, "Density"),
        vaporPressure: getPropertyValue(xmlDoc, "Vapor Pressure"),
        viscosity: getPropertyValue(xmlDoc, "Viscosity"),
        surfaceTension: getPropertyValue(xmlDoc, "Surface Tension"),
        refractiveIndex: getPropertyValue(xmlDoc, "Refractive Index"),
      }
      
      // Add to search history after successful search
      addToSearchHistory(query)
  
      setResult({ cid, properties })
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getPropertyValue = (xmlDoc, propertyName) => {
    const sections = xmlDoc.getElementsByTagName("Section")
    for (let section of sections) {
      if (section.getElementsByTagName("TOCHeading")[0]?.textContent === propertyName) {
        const values = section.getElementsByTagName("String")
        return Array.from(values).map(v => v.textContent).join("; ")
      }
    }
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Physical Properties</h1>
        
        <div className={styles.searchBox}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={compound}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter compound name (e.g., water, ethanol)"
              className={styles.searchInput}
              aria-label="Search for chemical compound"
              aria-autocomplete="list"
              aria-controls={suggestions.length > 0 ? "suggestions-list" : undefined}
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            />
            
            {compound.length >= 2 && suggestions.length > 0 && !result && (
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
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={() => searchPhysicalProperties()}
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
            <div className={styles.cidInfo}>
              <h2>CID: {result.cid}</h2>
            </div>
            
            <div className={styles.propertyCards}>
              {Object.entries(result.properties)
                .filter(([_, value]) => value)
                .map(([key, value]) => (
                  <div key={key} className={styles.propertyCard}>
                    <h3>{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p>{value}</p>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
