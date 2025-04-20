// components/Tabs.jsx
import { 
  FaMicroscope, 
  FaShieldAlt, 
  FaThLarge, 
  FaFlask, 
  FaExchangeAlt, 
  FaAtom, 
  FaDna 
} from "react-icons/fa";
import styles from './Tabs.module.css';

const Tabs = () => {
  const tabs = [
    { 
      label: 'Molecular Explorer', 
      icon: <FaMicroscope />, 
      path: '/MolecularExplorer' 
    },
    { 
      label: 'Safety Check', 
      icon: <FaShieldAlt />, 
      path: '/SafetyCheck' 
    },
    { 
      label: 'Periodic Table', 
      icon: <FaThLarge />, 
      path: '/periodic-table' 
    },
    { 
      label: 'PhysChem Analyzer', 
      icon: <FaFlask />, 
      path: '/PhysChemAnalyzer' 
    },
    { 
      label: 'Compound Comparator', 
      icon: <FaExchangeAlt />, 
      path: '/CompoundComparator' 
    },
    { 
      label: 'Chemical Properties', 
      icon: <FaAtom />, 
      path: '/ChemProperties' 
    },
    { 
      label: 'BioActivity', 
      icon: <FaDna />, 
      path: '/BioActivity' 
    }
  ];

  return (
    <div className={styles.tabsWrapper}>
      {tabs.map((tab, index) => (
        <a href={tab.path} key={index} className={styles.tab}>
          <div className={styles.icon}>{tab.icon}</div>
          <div className={styles.label}>{tab.label}</div>
        </a>
      ))}
    </div>
  );
};

export default Tabs;
