"use client"
import { useState, useEffect, useRef } from 'react'
import styles from './safety.module.css'

export default function ChemicalSafety() {
  const [chemical, setChemical] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chemicalSafetyHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (chemical.length < 2) {
        setSuggestions([])
        return
      }

      // Only fetch suggestions if no results are displayed
      if (!results) {
        try {
          const res = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${chemical}/JSON?limit=10`
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
  }, [chemical, results])

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setChemical(value)
    
    // Reset results when typing a new chemical
    if (results && value !== chemical) {
      setResults(null)
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
    localStorage.setItem('chemicalSafetyHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setChemical(historyItem)
    searchChemical(historyItem)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('chemicalSafetyHistory')
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
        } else if (chemical.trim()) {
          searchChemical();
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

  const processInfo = (info) => {
    if (!info?.Value?.StringWithMarkup) return ''
    return info.Value.StringWithMarkup
      .map(s => s.String)
      .filter(Boolean)
      .join('\n')
  }

  const processSection = (section) => {
    if (!section?.TOCHeading) return null

    const allInfo = section.Information?.map(info => {
      if (Array.isArray(info)) {
        return info.map(i => processInfo(i)).filter(Boolean).join('\n')
      }
      return processInfo(info)
    }).filter(Boolean).join('\n') || 'N/A'

    return {
      heading: section.TOCHeading,
      content: allInfo,
      description: section.Description || ''
    }
  }

  const processSections = (sections = []) => {
    if (!Array.isArray(sections)) return []
    
    return sections.flatMap(section => {
      const results = []
      const processed = processSection(section)
      if (processed) results.push(processed)
      
      if (section.Section) {
        results.push(...processSections(section.Section))
      }
      
      return results
    })
  }

  const processGHSData = (ghsData) => {
    const ghsSection = ghsData?.Record?.Section?.[0]?.Section?.[0]?.Section?.[0]?.Information || []
    
    return {
      signal: ghsSection.find(i => i.Name === "Signal")?.Value?.StringWithMarkup?.[0]?.String || '',
      pictograms: ghsSection.find(i => i.Name === "Pictogram(s)")?.Value?.StringWithMarkup?.[0]?.Markup?.map(m => m.URL) || [],
      hazards: ghsSection.find(i => i.Name === "GHS Hazard Statements")?.Value?.StringWithMarkup?.map(h => h.String) || [],
      precautions: ghsSection.find(i => i.Name === "Precautionary Statement Codes")?.Value?.StringWithMarkup?.map(p => p.String) || []
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setChemical(suggestion)
    setSuggestions([])
    searchChemical(suggestion)
  }

  const searchChemical = async (selectedChemical) => {
    const query = selectedChemical || chemical
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    setSuggestions([])
    setSelectedIndex(-1)

    try {
      // Get CID first
      const cidResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON`)
      if (!cidResponse.ok) throw new Error('Chemical not found')
      const cidData = await cidResponse.json()
      
      if (!cidData?.IdentifierList?.CID?.[0]) {
        throw new Error('No CID found for this chemical')
      }
      
      const cid = cidData.IdentifierList.CID[0]

      // Get all data sources
      const [ghsResponse, safetyResponse, healthResponse] = await Promise.all([
        fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS%20Classification`),
        fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Safety+and+Hazards`),
        fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Health%20Hazards`)
      ])

      if (!ghsResponse.ok || !safetyResponse.ok || !healthResponse.ok) {
        throw new Error('Failed to fetch chemical data')
      }

      const [ghsData, safetyData, healthData] = await Promise.all([
        ghsResponse.json(),
        safetyResponse.json(),
        healthResponse.json()
      ])

      const ghs = processGHSData(ghsData)
      const safety = processSections(safetyData?.Record?.Section?.[0]?.Section)
      const health = processSections(healthData?.Record?.Section)

      // Add to search history after successful search
      addToSearchHistory(query)
      
      setResults({ ghs, safety, health })

    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'An error occurred while searching')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Chemical Safety Information</h1>
        
        <div className={styles.searchBox}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={chemical}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter chemical name (e.g., acetone)"
              className={styles.searchInput}
              aria-label="Search for chemical compound"
              aria-autocomplete="list"
              aria-controls={suggestions.length > 0 ? "suggestions-list" : undefined}
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            />

            {chemical.length >= 2 && suggestions.length > 0 && !results && (
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
            onClick={() => searchChemical()}
            disabled={loading || !chemical.trim()}
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

        {error && <div className={styles.error}>{error}</div>}

        {results && (
          <div className={styles.results}>
            {/* GHS Classification */}
            <div className={styles.card}>
              <h2>GHS Classification</h2>
              
              {results.ghs.signal && (
                <div className={styles.signal}>
                  <strong>Signal Word:</strong> {results.ghs.signal}
                </div>
              )}

              {results.ghs.pictograms?.length > 0 && (
                <div className={styles.pictograms}>
                  {results.ghs.pictograms.map((url, i) => (
                    <img key={i} src={url} alt="GHS pictogram" className={styles.pictogram} />
                  ))}
                </div>
              )}

              {results.ghs.hazards?.length > 0 && (
                <div className={styles.hazards}>
                  <h3>Hazard Statements</h3>
                  {results.ghs.hazards.map((hazard, i) => (
                    <div key={i} className={styles.hazard}>{hazard}</div>
                  ))}
                </div>
              )}

              {results.ghs.precautions?.length > 0 && (
                <div className={styles.precautions}>
                  <h3>Precautionary Statements</h3>
                  {results.ghs.precautions.map((precaution, i) => (
                    <div key={i} className={styles.precaution}>{precaution}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Health Hazards */}
            {results.health?.length > 0 && (
              <div className={styles.card}>
                <h2>Health Hazards</h2>
                {results.health.map((section, i) => (
                  <div key={i} className={styles.section}>
                    <h3>{section.heading}</h3>
                    {section.description && (
                      <p className={styles.description}>{section.description}</p>
                    )}
                    <div className={styles.content}>
                      {section.content.split('\n').map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Safety Information */}
            {results.safety?.length > 0 && (
              <div className={styles.card}>
                <h2>Safety Information</h2>
                {results.safety.map((section, i) => (
                  <div key={i} className={styles.section}>
                    <h3>{section.heading}</h3>
                    {section.description && (
                      <p className={styles.description}>{section.description}</p>
                    )}
                    <div className={styles.content}>
                      {section.content.split('\n').map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
