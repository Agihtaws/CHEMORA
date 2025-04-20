"use client"
import { useState, useEffect } from 'react'
import styles from './bioactivity.module.css'

export default function ChemicalBioactivity() {
  const [chemblNumber, setChemblNumber] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bioactivityHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Handle input change - only allow numbers
  const handleInputChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '')
    setChemblNumber(value)
  }

  // Get full CHEMBL ID
  const getFullChemblId = (number) => {
    return `CHEMBL${number}`
  }

  // Add to search history
  const addToSearchHistory = (chemblId) => {
    if (!chemblId.trim()) return
    
    // Create updated history with new term at the beginning and remove duplicates
    const updatedHistory = [chemblId, ...searchHistory.filter(item => item !== chemblId)]
    
    // Limit to 10 items
    const limitedHistory = updatedHistory.slice(0, 10)
    
    // Update state and localStorage
    setSearchHistory(limitedHistory)
    localStorage.setItem('bioactivityHistory', JSON.stringify(limitedHistory))
  }

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    // Extract just the number part from the CHEMBL ID
    const numberPart = historyItem.replace('CHEMBL', '')
    setChemblNumber(numberPart)
    searchBioactivity(historyItem)
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('bioactivityHistory')
  }

  const searchBioactivity = async (selectedCompound) => {
    const fullChemblId = selectedCompound || getFullChemblId(chemblNumber)
    if (!chemblNumber && !selectedCompound) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://www.ebi.ac.uk/chembl/api/data/activity.json?molecule_chembl_id=${fullChemblId}`)
      if (!response.ok) {
        throw new Error('Bioactivity data not found')
      }
      const data = await response.json()
      
      // Add to search history after successful search
      addToSearchHistory(fullChemblId)
      
      setResults(data.activities)
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
        <h1 className={styles.title}>Chemical Bioactivity</h1>
        
        <div className={styles.searchBox}>
          <div className={styles.chemblInputWrapper}>
            <div className={styles.chemblPrefix}>CHEMBL</div>
            <input
              type="text"
              value={chemblNumber}
              onChange={handleInputChange}
              placeholder="Enter ID number (e.g., 25)"
              className={styles.chemblInput}
            />
          </div>
          <button 
            onClick={() => searchBioactivity()}
            disabled={loading || !chemblNumber.trim()}
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

        {results && results.length === 0 && (
          <div className={styles.noResults}>
            No bioactivity data found for {getFullChemblId(chemblNumber)}
          </div>
        )}

        {results && results.length > 0 && (
          <div className={styles.results}>
            <h2>Found {results.length} bioactivity results</h2>
            <div className={styles.grid}>
              {results.map((activity, index) => (
                <div key={index} className={styles.card}>
                  <div className={styles.propertiesGrid}>
                    <div className={styles.propertyItem}>
                      <span>Activity Type:</span>
                      <span>{activity.standard_type}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span>Value:</span>
                      <span>{activity.standard_value} {activity.standard_units}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span>Target:</span>
                      <span>{activity.target_pref_name}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span>Assay:</span>
                      <span>{activity.assay_description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
