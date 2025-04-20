'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './compare.module.css'

export default function CompoundComparison() {
  const [compound1, setCompound1] = useState('')
  const [compound2, setCompound2] = useState('')
  const [suggestions1, setSuggestions1] = useState([])
  const [suggestions2, setSuggestions2] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bothCompoundsSelected, setBothCompoundsSelected] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [selectedIndex1, setSelectedIndex1] = useState(-1)
  const [selectedIndex2, setSelectedIndex2] = useState(-1)
  const input1Ref = useRef(null)
  const input2Ref = useRef(null)

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('compareHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 🌟 Fetch autocomplete suggestions
  const fetchSuggestions = async (compound, setSuggestions) => {
    if (compound.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${compound}/JSON?limit=10`
      )
      const data = await res.json()
      setSuggestions(data?.dictionary_terms?.compound || [])
    } catch (err) {
      setSuggestions([])
    }
  }

  // Check if both compounds are selected and ready to compare
  useEffect(() => {
    if (compound1.trim() && compound2.trim()) {
      setBothCompoundsSelected(true)
    } else {
      setBothCompoundsSelected(false)
    }
  }, [compound1, compound2])

  useEffect(() => {
    // Only fetch suggestions if no results are displayed
    if (!results) {
      fetchSuggestions(compound1, setSuggestions1)
    } else {
      setSuggestions1([]) // Clear suggestions when results are shown
    }
    setSelectedIndex1(-1) // Reset selection when suggestions change
  }, [compound1, results])

  useEffect(() => {
    // Only fetch suggestions if no results are displayed
    if (!results) {
      fetchSuggestions(compound2, setSuggestions2)
    } else {
      setSuggestions2([]) // Clear suggestions when results are shown
    }
    setSelectedIndex2(-1) // Reset selection when suggestions change
  }, [compound2, results])

  // Handle input change
  const handleInputChange1 = (e) => {
    const value = e.target.value
    setCompound1(value)
    
    // Reset results when typing a new compound
    if (results && value !== compound1) {
      setResults(null)
    }
  }
  
  const handleInputChange2 = (e) => {
    const value = e.target.value
    setCompound2(value)
    
    // Reset results when typing a new compound
    if (results && value !== compound2) {
      setResults(null)
    }
  }

  // Add to search history
  const addToSearchHistory = (pair) => {
    if (!pair.c1.trim() || !pair.c2.trim()) return
    
    // Create updated history with new pair at the beginning and remove duplicates
    const updatedHistory = [
      pair,
      ...searchHistory.filter(item => !(item.c1 === pair.c1 && item.c2 === pair.c2) && 
                                     !(item.c1 === pair.c2 && item.c2 === pair.c1))
    ]
    
    // Limit to 10 items
    const limitedHistory = updatedHistory.slice(0, 10)
    
    // Update state and localStorage
    setSearchHistory(limitedHistory)
    localStorage.setItem('compareHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setCompound1(historyItem.c1)
    setCompound2(historyItem.c2)
    compareCompounds(historyItem.c1, historyItem.c2)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('compareHistory')
  }

  // Handle suggestion selection with auto-search if both compounds are selected
  const handleSuggestionClick1 = (suggestion) => {
    setCompound1(suggestion)
    setSuggestions1([])
    
    // If the other compound is already selected, trigger comparison automatically
    if (compound2.trim()) {
      setTimeout(() => compareCompounds(suggestion, compound2), 100)
    }
  }
  
  const handleSuggestionClick2 = (suggestion) => {
    setCompound2(suggestion)
    setSuggestions2([])
    
    // If the other compound is already selected, trigger comparison automatically
    if (compound1.trim()) {
      setTimeout(() => compareCompounds(compound1, suggestion), 100)
    }
  }

  // 🎮 Handle keyboard navigation for first input
  const handleKeyDown1 = (e) => {
    if (!suggestions1.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex1(prevIndex => 
          prevIndex < suggestions1.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex1(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex1 >= 0) {
          handleSuggestionClick1(suggestions1[selectedIndex1]);
          input1Ref.current.blur();
        } else if (bothCompoundsSelected) {
          compareCompounds();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setSuggestions1([]);
        setSelectedIndex1(-1);
        input1Ref.current.blur();
        break;
        
      case 'Tab':
        if (suggestions1.length && selectedIndex1 >= 0) {
          e.preventDefault();
          handleSuggestionClick1(suggestions1[selectedIndex1]);
        }
        break;
        
      default:
        break;
    }
  };

  // 🎮 Handle keyboard navigation for second input
  const handleKeyDown2 = (e) => {
    if (!suggestions2.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex2(prevIndex => 
          prevIndex < suggestions2.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex2(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex2 >= 0) {
          handleSuggestionClick2(suggestions2[selectedIndex2]);
          input2Ref.current.blur();
        } else if (bothCompoundsSelected) {
          compareCompounds();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setSuggestions2([]);
        setSelectedIndex2(-1);
        input2Ref.current.blur();
        break;
        
      case 'Tab':
        if (suggestions2.length && selectedIndex2 >= 0) {
          e.preventDefault();
          handleSuggestionClick2(suggestions2[selectedIndex2]);
        }
        break;
        
      default:
        break;
    }
  };

  const compareCompounds = async (c1 = compound1, c2 = compound2) => {
    if (!c1.trim() || !c2.trim()) return
  
    setLoading(true)
    setError(null)
    setSuggestions1([]) // Clear suggestions when comparing
    setSuggestions2([]) // Clear suggestions when comparing
    setSelectedIndex1(-1)
    setSelectedIndex2(-1)
  
    try {
      // Get CIDs first
      const cid1Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(c1)}/cids/JSON`)
      const cid2Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(c2)}/cids/JSON`)
  
      if (!cid1Response.ok || !cid2Response.ok) {
        throw new Error('One or both compounds not found')
      }
  
      const cid1Data = await cid1Response.json()
      const cid2Data = await cid2Response.json()
      
      const cid1 = cid1Data.IdentifierList.CID[0]
      const cid2 = cid2Data.IdentifierList.CID[0]
  
      // Now get formulas using the CIDs
      const formula1Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid1}/property/MolecularFormula/JSON`)
      const formula2Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid2}/property/MolecularFormula/JSON`)
      
      const formula1Data = await formula1Response.json()
      const formula2Data = await formula2Response.json()
  
      // Get physical properties for both compounds
      const props1Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid1}/XML?heading=Experimental+Properties`)
      const props2Response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid2}/XML?heading=Experimental+Properties`)
  
      if (!props1Response.ok || !props2Response.ok) {
        throw new Error('Properties not found')
      }
  
      const props1Text = await props1Response.text()
      const props2Text = await props2Response.text()
  
      const parser = new DOMParser()
      const props1Doc = parser.parseFromString(props1Text, "text/xml")
      const props2Doc = parser.parseFromString(props2Text, "text/xml")
  
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
  
      const mapProperties = (xmlDoc) => ({
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
        heatOfVaporization: getPropertyValue(xmlDoc, "Heat of Vaporization")
      })
  
      // Get 2D images
      const image1_2d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid1}/PNG`
      const image2_2d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid2}/PNG`

      // Add to search history after successful search
      addToSearchHistory({ c1, c2 })
  
      setResults({
        compound1: {
            cid: cid1,
            formula: formula1Data.PropertyTable.Properties[0].MolecularFormula,
            image_2d: image1_2d,
            physical: mapProperties(props1Doc)
          },
          compound2: {
            cid: cid2,
            formula: formula2Data.PropertyTable.Properties[0].MolecularFormula,
            image_2d: image2_2d,
            physical: mapProperties(props2Doc)
          }
        })
    } catch (err) {
      setError(err.message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Compare Chemical Compounds</h1>

        <div className={styles.searchBox}>
          <div className={styles.inputWrapper}>
            <input
              ref={input1Ref}
              type="text"
              value={compound1}
              onChange={handleInputChange1}
              onKeyDown={handleKeyDown1}
              placeholder="Enter first compound"
              className={styles.searchInput}
              aria-label="Search for first chemical compound"
              aria-autocomplete="list"
              aria-controls={suggestions1.length > 0 ? "suggestions-list-1" : undefined}
              aria-activedescendant={selectedIndex1 >= 0 ? `suggestion-1-${selectedIndex1}` : undefined}
            />
            {compound1.length >= 2 && suggestions1.length > 0 && !results && (
              <ul 
                id="suggestions-list-1"
                className={styles.suggestionsList}
                role="listbox"
              >
                {suggestions1.map((item, idx) => (
                  <li
                    id={`suggestion-1-${idx}`}
                    key={idx}
                    className={`${styles.suggestionItem} ${idx === selectedIndex1 ? styles.selected : ''}`}
                    onClick={() => handleSuggestionClick1(item)}
                    role="option"
                    aria-selected={idx === selectedIndex1}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.inputWrapper}>
            <input
              ref={input2Ref}
              type="text"
              value={compound2}
              onChange={handleInputChange2}
              onKeyDown={handleKeyDown2}
              placeholder="Enter second compound"
              className={styles.searchInput}
              aria-label="Search for second chemical compound"
              aria-autocomplete="list"
              aria-controls={suggestions2.length > 0 ? "suggestions-list-2" : undefined}
              aria-activedescendant={selectedIndex2 >= 0 ? `suggestion-2-${selectedIndex2}` : undefined}
            />
            {compound2.length >= 2 && suggestions2.length > 0 && !results && (
              <ul 
                id="suggestions-list-2"
                className={styles.suggestionsList}
                role="listbox"
              >
                {suggestions2.map((item, idx) => (
                  <li
                    id={`suggestion-2-${idx}`}
                    key={idx}
                    className={`${styles.suggestionItem} ${idx === selectedIndex2 ? styles.selected : ''}`}
                    onClick={() => handleSuggestionClick2(item)}
                    role="option"
                    aria-selected={idx === selectedIndex2}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={() => compareCompounds()}
            disabled={loading || !bothCompoundsSelected}
            className={styles.searchButton}
          >
            {loading ? <><span className={styles.spinner}></span>Comparing...</> : 'Compare'}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className={styles.historyContainer}>
            <div className={styles.historyHeader}>
              <h3>Recent Comparisons</h3>
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
                  {item.c1} vs {item.c2}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (<div className={styles.error}>{error}</div>)}

        {results && (
          <div className={styles.results}>
            {/* Structural Comparison */}
            <div className={styles.card}>
              <h2>Structural Comparison</h2>
              <div className={styles.structureViews}>
                <div className={styles.viewSection}>
                  <h3>2D View</h3>
                  <div className={styles.structures}>
                    <div>
                      <img src={results.compound1.image_2d} alt={`${compound1} 2D`} />
                      <p>{compound1}</p>
                    </div>
                    <div>
                      <img src={results.compound2.image_2d} alt={`${compound2} 2D`} />
                      <p>{compound2}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.viewSection}>
                  <h3>3D View</h3>
                  <div className={styles.structures}>
                    <iframe
                      src={`https://pubchem.ncbi.nlm.nih.gov/compound/${results.compound1.cid}#section=3D-Conformer&embed=true`}
                      className={styles.viewer3D}
                      title={`${compound1} 3D`}
                    />
                    <iframe
                      src={`https://pubchem.ncbi.nlm.nih.gov/compound/${results.compound2.cid}#section=3D-Conformer&embed=true`}
                      className={styles.viewer3D}
                      title={`${compound2} 3D`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Properties */}
            <div className={styles.card}>
              <h2>Basic Properties</h2>
              <div className={styles.comparisonTable}>
                <div className={styles.headerRow}>
                  <div>Property</div>
                  <div>{compound1}</div>
                  <div>{compound2}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>CID</div>
                  <div>{results.compound1.cid}</div>
                  <div>{results.compound2.cid}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Molecular Formula</div>
                  <div>{results.compound1.formula}</div>
                  <div>{results.compound2.formula}</div>
                </div>
              </div>
            </div>

            {/* Physical Properties */}
            <div className={styles.card}>
              <h2>Physical Properties</h2>
              <div className={styles.comparisonTable}>
                <div className={styles.headerRow}>
                  <div>Property</div>
                  <div>{compound1}</div>
                  <div>{compound2}</div>
                </div>

                {/* Physical Description Properties */}
                <div className={styles.propertyRow}>
                  <div>Physical Description</div>
                  <div>{results.compound1.physical.description || 'N/A'}</div>
                  <div>{results.compound2.physical.description || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Color/Form</div>
                  <div>{results.compound1.physical.color || 'N/A'}</div>
                  <div>{results.compound2.physical.color || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Odor</div>
                  <div>{results.compound1.physical.odor || 'N/A'}</div>
                  <div>{results.compound2.physical.odor || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Taste</div>
                  <div>{results.compound1.physical.taste || 'N/A'}</div>
                  <div>{results.compound2.physical.taste || 'N/A'}</div>
                </div>

                {/* Experimental Properties */}
                <div className={styles.propertyRow}>
                  <div>Boiling Point</div>
                  <div>{results.compound1.physical.boilingPoint || 'N/A'}</div>
                  <div>{results.compound2.physical.boilingPoint || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Melting Point</div>
                  <div>{results.compound1.physical.meltingPoint || 'N/A'}</div>
                  <div>{results.compound2.physical.meltingPoint || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Solubility</div>
                  <div>{results.compound1.physical.solubility || 'N/A'}</div>
                  <div>{results.compound2.physical.solubility || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Density</div>
                  <div>{results.compound1.physical.density || 'N/A'}</div>
                  <div>{results.compound2.physical.density || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Vapor Pressure</div>
                  <div>{results.compound1.physical.vaporPressure || 'N/A'}</div>
                  <div>{results.compound2.physical.vaporPressure || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Viscosity</div>
                  <div>{results.compound1.physical.viscosity || 'N/A'}</div>
                  <div>{results.compound2.physical.viscosity || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Surface Tension</div>
                  <div>{results.compound1.physical.surfaceTension || 'N/A'}</div>
                  <div>{results.compound2.physical.surfaceTension || 'N/A'}</div>
                </div>
                <div className={styles.propertyRow}>
                  <div>Refractive Index</div>
                  <div>{results.compound1.physical.refractiveIndex || 'N/A'}</div>
                  <div>{results.compound2.physical.refractiveIndex || 'N/A'}</div>
                </div>
            
                <div className={styles.propertyRow}>
                  <div>Heat of Vaporization</div>
                  <div>{results.compound1.physical.heatOfVaporization || 'N/A'}</div>
                  <div>{results.compound2.physical.heatOfVaporization || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
