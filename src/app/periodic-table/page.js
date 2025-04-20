"use client"
import { useState } from 'react'
import styles from './periodic.module.css'

export default function PeriodicTable() {
  const elements = [
    { atomic_number: 1, symbol: "H", name: "Hydrogen", atomic_mass: 1.008, category: "nonmetal", block: "s", period: 1, group: 1 },
    { atomic_number: 2, symbol: "He", name: "Helium", atomic_mass: 4.003, category: "noblegas", block: "s", period: 1, group: 18 },
    { atomic_number: 3, symbol: "Li", name: "Lithium", atomic_mass: 6.941, category: "alkali", block: "s", period: 2, group: 1 },
    { atomic_number: 4, symbol: "Be", name: "Beryllium", atomic_mass: 9.012, category: "alkalineearth", block: "s", period: 2, group: 2 },
    { atomic_number: 5, symbol: "B", name: "Boron", atomic_mass: 10.811, category: "metalloid", block: "p", period: 2, group: 13 },
    { atomic_number: 6, symbol: "C", name: "Carbon", atomic_mass: 12.011, category: "nonmetal", block: "p", period: 2, group: 14 },
    { atomic_number: 7, symbol: "N", name: "Nitrogen", atomic_mass: 14.007, category: "nonmetal", block: "p", period: 2, group: 15 },
    { atomic_number: 8, symbol: "O", name: "Oxygen", atomic_mass: 15.999, category: "nonmetal", block: "p", period: 2, group: 16 },
    { atomic_number: 9, symbol: "F", name: "Fluorine", atomic_mass: 18.998, category: "halogen", block: "p", period: 2, group: 17 },
    { atomic_number: 10, symbol: "Ne", name: "Neon", atomic_mass: 20.180, category: "noblegas", block: "p", period: 2, group: 18 },
    { atomic_number: 11, symbol: "Na", name: "Sodium", atomic_mass: 22.990, category: "alkali", block: "s", period: 3, group: 1 },
    { atomic_number: 12, symbol: "Mg", name: "Magnesium", atomic_mass: 24.305, category: "alkalineearth", block: "s", period: 3, group: 2 },
    { atomic_number: 13, symbol: "Al", name: "Aluminum", atomic_mass: 26.982, category: "metal", block: "p", period: 3, group: 13 },
    { atomic_number: 14, symbol: "Si", name: "Silicon", atomic_mass: 28.086, category: "metalloid", block: "p", period: 3, group: 14 },
    { atomic_number: 15, symbol: "P", name: "Phosphorus", atomic_mass: 30.974, category: "nonmetal", block: "p", period: 3, group: 15 },
    { atomic_number: 16, symbol: "S", name: "Sulfur", atomic_mass: 32.065, category: "nonmetal", block: "p", period: 3, group: 16 },
    { atomic_number: 17, symbol: "Cl", name: "Chlorine", atomic_mass: 35.453, category: "halogen", block: "p", period: 3, group: 17 },
    { atomic_number: 18, symbol: "Ar", name: "Argon", atomic_mass: 39.948, category: "noblegas", block: "p", period: 3, group: 18 },
    { atomic_number: 19, symbol: "K", name: "Potassium", atomic_mass: 39.098, category: "alkali", block: "s", period: 4, group: 1 },
    { atomic_number: 20, symbol: "Ca", name: "Calcium", atomic_mass: 40.078, category: "alkalineearth", block: "s", period: 4, group: 2 },
    { atomic_number: 21, symbol: "Sc", name: "Scandium", atomic_mass: 44.956, category: "transition", block: "d", period: 4, group: 3 },
    { atomic_number: 22, symbol: "Ti", name: "Titanium", atomic_mass: 47.867, category: "transition", block: "d", period: 4, group: 4 },
    { atomic_number: 23, symbol: "V", name: "Vanadium", atomic_mass: 50.942, category: "transition", block: "d", period: 4, group: 5 },
    { atomic_number: 24, symbol: "Cr", name: "Chromium", atomic_mass: 51.996, category: "transition", block: "d", period: 4, group: 6 },
    { atomic_number: 25, symbol: "Mn", name: "Manganese", atomic_mass: 54.938, category: "transition", block: "d", period: 4, group: 7 },
    { atomic_number: 26, symbol: "Fe", name: "Iron", atomic_mass: 55.845, category: "transition", block: "d", period: 4, group: 8 },
    { atomic_number: 27, symbol: "Co", name: "Cobalt", atomic_mass: 58.933, category: "transition", block: "d", period: 4, group: 9 },
    { atomic_number: 28, symbol: "Ni", name: "Nickel", atomic_mass: 58.693, category: "transition", block: "d", period: 4, group: 10 },
    { atomic_number: 29, symbol: "Cu", name: "Copper", atomic_mass: 63.546, category: "transition", block: "d", period: 4, group: 11 },
    { atomic_number: 30, symbol: "Zn", name: "Zinc", atomic_mass: 65.380, category: "transition", block: "d", period: 4, group: 12 },
    { atomic_number: 31, symbol: "Ga", name: "Gallium", atomic_mass: 69.723, category: "metal", block: "p", period: 4, group: 13 },
    { atomic_number: 32, symbol: "Ge", name: "Germanium", atomic_mass: 72.640, category: "metalloid", block: "p", period: 4, group: 14 },
    { atomic_number: 33, symbol: "As", name: "Arsenic", atomic_mass: 74.922, category: "metalloid", block: "p", period: 4, group: 15 },
    { atomic_number: 34, symbol: "Se", name: "Selenium", atomic_mass: 78.960, category: "nonmetal", block: "p", period: 4, group: 16 },
    { atomic_number: 35, symbol: "Br", name: "Bromine", atomic_mass: 79.904, category: "halogen", block: "p", period: 4, group: 17 },
    { atomic_number: 36, symbol: "Kr", name: "Krypton", atomic_mass: 83.798, category: "noblegas", block: "p", period: 4, group: 18 },
    { atomic_number: 37, symbol: "Rb", name: "Rubidium", atomic_mass: 85.468, category: "alkali", block: "s", period: 5, group: 1 },
  { atomic_number: 38, symbol: "Sr", name: "Strontium", atomic_mass: 87.62, category: "alkalineearth", block: "s", period: 5, group: 2 },
  { atomic_number: 39, symbol: "Y", name: "Yttrium", atomic_mass: 88.906, category: "transition", block: "d", period: 5, group: 3 },
  { atomic_number: 40, symbol: "Zr", name: "Zirconium", atomic_mass: 91.224, category: "transition", block: "d", period: 5, group: 4 },
  { atomic_number: 41, symbol: "Nb", name: "Niobium", atomic_mass: 92.906, category: "transition", block: "d", period: 5, group: 5 },
  { atomic_number: 42, symbol: "Mo", name: "Molybdenum", atomic_mass: 95.95, category: "transition", block: "d", period: 5, group: 6 },
  { atomic_number: 43, symbol: "Tc", name: "Technetium", atomic_mass: 98.0, category: "transition", block: "d", period: 5, group: 7 },
  { atomic_number: 44, symbol: "Ru", name: "Ruthenium", atomic_mass: 101.07, category: "transition", block: "d", period: 5, group: 8 },
  { atomic_number: 45, symbol: "Rh", name: "Rhodium", atomic_mass: 102.91, category: "transition", block: "d", period: 5, group: 9 },
  { atomic_number: 46, symbol: "Pd", name: "Palladium", atomic_mass: 106.42, category: "transition", block: "d", period: 5, group: 10 },
  { atomic_number: 47, symbol: "Ag", name: "Silver", atomic_mass: 107.87, category: "transition", block: "d", period: 5, group: 11 },
  { atomic_number: 48, symbol: "Cd", name: "Cadmium", atomic_mass: 112.41, category: "transition", block: "d", period: 5, group: 12 },
  { atomic_number: 49, symbol: "In", name: "Indium", atomic_mass: 114.82, category: "metal", block: "p", period: 5, group: 13 },
  { atomic_number: 50, symbol: "Sn", name: "Tin", atomic_mass: 118.71, category: "metal", block: "p", period: 5, group: 14 },
  { atomic_number: 51, symbol: "Sb", name: "Antimony", atomic_mass: 121.76, category: "metalloid", block: "p", period: 5, group: 15 },
  { atomic_number: 52, symbol: "Te", name: "Tellurium", atomic_mass: 127.60, category: "metalloid", block: "p", period: 5, group: 16 },
  { atomic_number: 53, symbol: "I", name: "Iodine", atomic_mass: 126.90, category: "halogen", block: "p", period: 5, group: 17 },
  { atomic_number: 54, symbol: "Xe", name: "Xenon", atomic_mass: 131.29, category: "noblegas", block: "p", period: 5, group: 18 },
  { atomic_number: 55, symbol: "Cs", name: "Cesium", atomic_mass: 132.905, category: "alkali", block: "s", period: 6, group: 1 },
  { atomic_number: 56, symbol: "Ba", name: "Barium", atomic_mass: 137.327, category: "alkalineearth", block: "s", period: 6, group: 2 },
  { atomic_number: 57, symbol: "La", name: "Lanthanum", atomic_mass: 138.905, category: "lanthanide", block: "f", period: 6, group: 3 },
  { atomic_number: 58, symbol: "Ce", name: "Cerium", atomic_mass: 140.116, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 59, symbol: "Pr", name: "Praseodymium", atomic_mass: 140.908, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 60, symbol: "Nd", name: "Neodymium", atomic_mass: 144.242, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 61, symbol: "Pm", name: "Promethium", atomic_mass: 145, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 62, symbol: "Sm", name: "Samarium", atomic_mass: 150.36, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 63, symbol: "Eu", name: "Europium", atomic_mass: 151.964, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 64, symbol: "Gd", name: "Gadolinium", atomic_mass: 157.25, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 65, symbol: "Tb", name: "Terbium", atomic_mass: 158.925, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 66, symbol: "Dy", name: "Dysprosium", atomic_mass: 162.500, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 67, symbol: "Ho", name: "Holmium", atomic_mass: 164.930, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 68, symbol: "Er", name: "Erbium", atomic_mass: 167.259, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 69, symbol: "Tm", name: "Thulium", atomic_mass: 168.934, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 70, symbol: "Yb", name: "Ytterbium", atomic_mass: 173.045, category: "lanthanide", block: "f", period: 6, group: null },
  { atomic_number: 71, symbol: "Lu", name: "Lutetium", atomic_mass: 174.967, category: "lanthanide", block: "d", period: 6, group: 3 },
  { atomic_number: 72, symbol: "Hf", name: "Hafnium", atomic_mass: 178.49, category: "transition", block: "d", period: 6, group: 4 },
  { atomic_number: 73, symbol: "Ta", name: "Tantalum", atomic_mass: 180.948, category: "transition", block: "d", period: 6, group: 5 },
  { atomic_number: 74, symbol: "W", name: "Tungsten", atomic_mass: 183.84, category: "transition", block: "d", period: 6, group: 6 },
  { atomic_number: 75, symbol: "Re", name: "Rhenium", atomic_mass: 186.207, category: "transition", block: "d", period: 6, group: 7 },
  { atomic_number: 76, symbol: "Os", name: "Osmium", atomic_mass: 190.23, category: "transition", block: "d", period: 6, group: 8 },
  { atomic_number: 77, symbol: "Ir", name: "Iridium", atomic_mass: 192.217, category: "transition", block: "d", period: 6, group: 9 },
  { atomic_number: 78, symbol: "Pt", name: "Platinum", atomic_mass: 195.084, category: "transition", block: "d", period: 6, group: 10 },
  { atomic_number: 79, symbol: "Au", name: "Gold", atomic_mass: 196.967, category: "transition", block: "d", period: 6, group: 11 },
  { atomic_number: 80, symbol: "Hg", name: "Mercury", atomic_mass: 200.592, category: "transition", block: "d", period: 6, group: 12 },
  { atomic_number: 81, symbol: "Tl", name: "Thallium", atomic_mass: 204.383, category: "metal", block: "p", period: 6, group: 13 },
  { atomic_number: 82, symbol: "Pb", name: "Lead", atomic_mass: 207.2, category: "metal", block: "p", period: 6, group: 14 },
  { atomic_number: 83, symbol: "Bi", name: "Bismuth", atomic_mass: 208.980, category: "metal", block: "p", period: 6, group: 15 },
  { atomic_number: 84, symbol: "Po", name: "Polonium", atomic_mass: 209, category: "metalloid", block: "p", period: 6, group: 16 },
  { atomic_number: 85, symbol: "At", name: "Astatine", atomic_mass: 210, category: "halogen", block: "p", period: 6, group: 17 },
  { atomic_number: 86, symbol: "Rn", name: "Radon", atomic_mass: 222, category: "noblegas", block: "p", period: 6, group: 18 },
  { atomic_number: 87, symbol: "Fr", name: "Francium", atomic_mass: 223, category: "alkali", block: "s", period: 7, group: 1 },
  { atomic_number: 88, symbol: "Ra", name: "Radium", atomic_mass: 226, category: "alkalineearth", block: "s", period: 7, group: 2 },
  { atomic_number: 89, symbol: "Ac", name: "Actinium", atomic_mass: 227, category: "actinide", block: "f", period: 7, group: 3 },
  { atomic_number: 90, symbol: "Th", name: "Thorium", atomic_mass: 232.0377, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 91, symbol: "Pa", name: "Protactinium", atomic_mass: 231.0359, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 92, symbol: "U", name: "Uranium", atomic_mass: 238.0289, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 93, symbol: "Np", name: "Neptunium", atomic_mass: 237, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 94, symbol: "Pu", name: "Plutonium", atomic_mass: 244, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 95, symbol: "Am", name: "Americium", atomic_mass: 243, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 96, symbol: "Cm", name: "Curium", atomic_mass: 247, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 97, symbol: "Bk", name: "Berkelium", atomic_mass: 247, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 98, symbol: "Cf", name: "Californium", atomic_mass: 251, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 99, symbol: "Es", name: "Einsteinium", atomic_mass: 252, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 100, symbol: "Fm", name: "Fermium", atomic_mass: 257, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 101, symbol: "Md", name: "Mendelevium", atomic_mass: 258, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 102, symbol: "No", name: "Nobelium", atomic_mass: 259, category: "actinide", block: "f", period: 7, group: null },
  { atomic_number: 103, symbol: "Lr", name: "Lawrencium", atomic_mass: 266, category: "actinide", block: "d", period: 7, group: 3 },
  { atomic_number: 104, symbol: "Rf", name: "Rutherfordium", atomic_mass: 267, category: "transition", block: "d", period: 7, group: 4 },
  { atomic_number: 105, symbol: "Db", name: "Dubnium", atomic_mass: 270, category: "transition", block: "d", period: 7, group: 5 },
  { atomic_number: 106, symbol: "Sg", name: "Seaborgium", atomic_mass: 271, category: "transition", block: "d", period: 7, group: 6 },
  { atomic_number: 107, symbol: "Bh", name: "Bohrium", atomic_mass: 270, category: "transition", block: "d", period: 7, group: 7 },
  { atomic_number: 108, symbol: "Hs", name: "Hassium", atomic_mass: 277, category: "transition", block: "d", period: 7, group: 8 },
  { atomic_number: 109, symbol: "Mt", name: "Meitnerium", atomic_mass: 278, category: "unknown", block: "d", period: 7, group: 9 },
  { atomic_number: 110, symbol: "Ds", name: "Darmstadtium", atomic_mass: 281, category: "unknown", block: "d", period: 7, group: 10 },
  { atomic_number: 111, symbol: "Rg", name: "Roentgenium", atomic_mass: 282, category: "unknown", block: "d", period: 7, group: 11 },
  { atomic_number: 112, symbol: "Cn", name: "Copernicium", atomic_mass: 285, category: "transition", block: "d", period: 7, group: 12 },
  { atomic_number: 113, symbol: "Nh", name: "Nihonium", atomic_mass: 286, category: "post-transition", block: "p", period: 7, group: 13 },
  { atomic_number: 114, symbol: "Fl", name: "Flerovium", atomic_mass: 289, category: "post-transition", block: "p", period: 7, group: 14 },
  { atomic_number: 115, symbol: "Mc", name: "Moscovium", atomic_mass: 290, category: "post-transition", block: "p", period: 7, group: 15 },
  { atomic_number: 116, symbol: "Lv", name: "Livermorium", atomic_mass: 293, category: "post-transition", block: "p", period: 7, group: 16 },
  { atomic_number: 117, symbol: "Ts", name: "Tennessine", atomic_mass: 294, category: "halogen", block: "p", period: 7, group: 17 },
  { atomic_number: 118, symbol: "Og", name: "Oganesson", atomic_mass: 294, category: "noblegas", block: "p", period: 7, group: 18 }
  ];


  const [selectedElement, setSelectedElement] = useState(null)
  const [elementDetails, setElementDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCategoryClass = (category) => {
    return styles[category.toLowerCase().replace(/\s+/g, '')]
  }

  const fetchElementDetails = async (element) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON`)
      if (!response.ok) {
        throw new Error('Failed to fetch element details')
      }
      const data = await response.json()
      
      // Find the element in PubChem data
      const pubchemElement = data.Table.Row.find(
        row => row.Cell[2].toLowerCase() === element.name.toLowerCase()
      )
      
      if (!pubchemElement) {
        throw new Error('Element details not found')
      }

      // Map PubChem data to our format
      const combinedDetails = {
        ...element,
        electron_configuration: pubchemElement.Cell[5],
        electronegativity: pubchemElement.Cell[6],
        atomic_radius: pubchemElement.Cell[7],
        ionization_energy: pubchemElement.Cell[8],
        electron_affinity: pubchemElement.Cell[9],
        oxidation_states: pubchemElement.Cell[10],
        standard_state: pubchemElement.Cell[11],
        melting_point: pubchemElement.Cell[12],
        boiling_point: pubchemElement.Cell[13],
        density: pubchemElement.Cell[14],
        year_discovered: pubchemElement.Cell[16]
      }
      
      setElementDetails(combinedDetails)
    } catch (err) {
      setError(err.message)
      setElementDetails(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
      <div className={styles.header}>
        
        <h1 className={styles.title}>Periodic Table</h1>
        </div>
        
        <div className={styles.periodicTable}>
          {elements.map(element => (
            <div
              key={element.atomic_number}
              className={`${styles.element} ${getCategoryClass(element.category)}`}
              style={{
                "--atomic-number": element.atomic_number,
                "--group": element.group,
                gridRow: element.category === "lanthanide" ? 
                  9 : 
                  element.category === "actinide" ? 
                  10 : 
                  element.period,
                gridColumn: element.category === "lanthanide" ? 
                  `${3 + (element.atomic_number - 57)} / span 1` : 
                  element.category === "actinide" ? 
                  `${3 + (element.atomic_number - 89)} / span 1` : 
                  element.group,
                justifySelf: element.category === "lanthanide" || element.category === "actinide" ? 
                  "center" : "stretch"
              }}
              data-category={element.category}
              data-block={element.block}
              onClick={() => {
                setSelectedElement(element)
                fetchElementDetails(element)
              }}
            >
              <div className={styles.atomicNumber}>{element.atomic_number}</div>
              <div className={styles.symbol}>{element.symbol}</div>
              <div className={styles.name}>{element.name}</div>
              <div className={styles.mass}>{element.atomic_mass.toFixed(3)}</div>
            </div>
          ))}
        </div>
  
        {selectedElement && (
          <div className={styles.overlay}>
            <div className={styles.elementDetails}>
              <div className={styles.closeButton} onClick={() => setSelectedElement(null)}>×</div>
              <h2>{selectedElement.name}</h2>
              {loading ? (
                <div className={styles.loading}>Loading details...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : elementDetails && (
                <div className={styles.detailsGrid}>
                  <div className={styles.basicInfo}>
                    <div className={styles.detailRow}>
                      <span>Atomic Number:</span>
                      <span>{elementDetails.atomic_number}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Symbol:</span>
                      <span>{elementDetails.symbol}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Name:</span>
                      <span>{elementDetails.name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Atomic Mass:</span>
                      <span>{elementDetails.atomic_mass}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Category:</span>
                      <span>{elementDetails.category}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Block:</span>
                      <span>{elementDetails.block}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Electron Configuration:</span>
                      <span>{elementDetails.electron_configuration || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Electronegativity:</span>
                      <span>{elementDetails.electronegativity || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Atomic Radius (pm):</span>
                      <span>{elementDetails.atomic_radius || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Ionization Energy (eV):</span>
                      <span>{elementDetails.ionization_energy || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Electron Affinity (eV):</span>
                      <span>{elementDetails.electron_affinity || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Oxidation States:</span>
                      <span>{elementDetails.oxidation_states || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Standard State:</span>
                      <span>{elementDetails.standard_state || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Melting Point (K):</span>
                      <span>{elementDetails.melting_point || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Boiling Point (K):</span>
                      <span>{elementDetails.boiling_point || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Density (g/cm³):</span>
                      <span>{elementDetails.density || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Year Discovered:</span>
                      <span>{elementDetails.year_discovered || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
  
}  