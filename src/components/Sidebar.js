// components/Sidebar.js
"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import styles from './Sidebar.module.css'
import { 
  FaHome,
  FaMicroscope,
  FaShieldAlt,
  FaThLarge,
  FaFlask,
  FaExchangeAlt,
  FaAtom,
  FaDna,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes
} from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { path: '/', name: 'Home', icon: <FaHome /> },
    { path: '/MolecularExplorer', name: 'Molecular Explorer', icon: <FaMicroscope /> },
    { path: '/SafetyCheck', name: 'SafetyCheck', icon: <FaShieldAlt /> },
    { path: '/periodic-table', name: 'Periodic Table', icon: <FaThLarge /> },
    { path: '/PhysChemAnalyzer', name: 'PhysChem Analyzer', icon: <FaFlask /> },
    { path: '/CompoundComparator', name: 'CompoundComparator', icon: <FaExchangeAlt /> },
    { path: '/ChemProperties', name: 'ChemProperties', icon: <FaAtom /> },
    { path: '/BioActivity', name: 'BioActivity', icon: <FaDna /> },
  ]
  

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/">
        Chemora
        </Link>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.name}</span>
          </Link>
        ))}
      </nav>
      <button 
        onClick={toggleTheme} 
        className={`${styles.themeToggle} themeToggle`}
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
    </div>
  )
}
