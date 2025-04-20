"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import useIsMobile from "@/hooks/useIsMobile"; // 👈 Import the hook
import styles from "./Sidebar.module.css";
import {
  FaHome, FaMicroscope, FaShieldAlt, FaThLarge, FaFlask, FaExchangeAlt, FaAtom, FaDna,
  FaMoon, FaSun, FaBars, FaTimes,
} from "react-icons/fa";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile(); // 👈 Use the hook
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/", name: "Home", icon: <FaHome /> },
    { path: "/MolecularExplorer", name: "Molecular Explorer", icon: <FaMicroscope /> },
    { path: "/SafetyCheck", name: "SafetyCheck", icon: <FaShieldAlt /> },
    { path: "/periodic-table", name: "Periodic Table", icon: <FaThLarge /> },
    { path: "/PhysChemAnalyzer", name: "PhysChem Analyzer", icon: <FaFlask /> },
    { path: "/CompoundComparator", name: "CompoundComparator", icon: <FaExchangeAlt /> },
    { path: "/ChemProperties", name: "ChemProperties", icon: <FaAtom /> },
    { path: "/BioActivity", name: "BioActivity", icon: <FaDna /> },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {isMobile && (
        <button onClick={toggleSidebar} className={styles.menuButton}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}
      <div
        className={`${styles.sidebar} ${isMobile ? styles.mobile : ""} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.logo}>
          <Link href="/">Chemora</Link>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.name}</span>
            </Link>
          ))}
        </nav>
        <button onClick={toggleTheme} className={styles.themeToggle}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
      {isMobile && isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}
    </>
  );
}
