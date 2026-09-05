import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { mediaUrl } from '../services/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <nav className="top-nav">
      <div className="brand">
        <img src={mediaUrl('media/images-programs/isulogo.png')} alt="Isabela State University logo" />
        <div className="brand-text">
          <div className="brand-main">ISABELA STATE UNIVERSITY</div>
          <div className="brand-sub">Cauayan campus</div>
        </div>
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
            HOME
          </NavLink>
        </li>
        <li><a href="/#programList" onClick={close}>PROGRAMS</a></li>
        <li><a href="/#map-section" onClick={close}>MAPS</a></li>
        <li><a href="/#about" onClick={close}>ABOUT</a></li>
        <li>
          <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'nav-active' : ''} onClick={close}>
            ADMIN
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
