import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <nav className="top-nav">
      <div className="brand">
        <img src="/images/isulogo.png" alt="ISU Cauayan logo" />
        <span>ISU Cauayan</span>
      </div>

      <button
        className="nav-toggle"
        id="navToggle"
        type="button"
        aria-label="Toggle navigation"
        aria-controls="siteNavLinks"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links${isOpen ? ' open' : ''}`} id="siteNavLinks">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-active' : ''} onClick={close}>
            Home
          </NavLink>
        </li>
        <li><a href="/#programList" onClick={close}>Programs</a></li>
        <li><a href="/#map-section" onClick={close}>Map</a></li>
        <li><a href="/#about" onClick={close}>About</a></li>
        <li>
          <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'nav-active' : ''} onClick={close}>
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
