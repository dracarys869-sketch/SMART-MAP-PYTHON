import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getPrograms, getLocations } from '../services/api';
import Navbar from '../components/Navbar';
import ProgramCard from '../components/ProgramCard';
import Map from '../components/Map';

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const loc = useLocation();

  useEffect(() => {
    getPrograms()
      .then(res => { setPrograms(res.data); setFilteredPrograms(res.data); })
      .catch(err => setError(err.response?.data?.detail || err.message));

    getLocations()
      .then(res => setLocations(res.data))
      .catch(err => setError(err.response?.data?.detail || err.message));
  }, []);

  // Debounced filter
  useEffect(() => {
    const t = setTimeout(() => {
      const lower = search.toLowerCase();
      setFilteredPrograms(
        programs.filter(p => {
          const textMatch =
            p.name.toLowerCase().includes(lower) ||
            p.college.toLowerCase().includes(lower) ||
            (p.location_details?.name || '').toLowerCase().includes(lower);
          const collegeMatch = collegeFilter === 'all' || p.college === collegeFilter;
          return textMatch && collegeMatch;
        })
      );
    }, 200);
    return () => clearTimeout(t);
  }, [search, collegeFilter, programs]);

  // Handle ?routeTo=<name> from ProgramDetail
  useEffect(() => {
    const routeName = new URLSearchParams(loc.search).get('routeTo');
    if (!routeName) return;
    const timer = setTimeout(() => {
      mapRef.current?.locateOnMap(routeName);
      document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
    return () => clearTimeout(timer);
  }, [loc.search, locations]);

  const handleLocate = (locationName) => {
    mapRef.current?.locateOnMap(locationName);
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const colleges = [...new Set(programs.map(p => p.college))].sort();

  return (
    <>
      {/* ── Hero Section (nav + two-column layout) ── */}
      <section className="site-hero" id="top">
        <Navbar />

        <div className="hero-body">
          <div className="hero-image">
            <img src="http://127.0.0.1:8000/media/images-programs/isufront.png" alt="ISU Cauayan Campus" />
          </div>
          <div className="hero-content">
            <span className="hero-badge">📍 CAMPUS DISCOVERY PLATFORM</span>
            <h1>Isabela State University<br /><span className="hero-highlight">Interactive Map</span></h1>
            <p>
              Explore academic programs, locate key campus buildings,
              and plan your path in one place.
            </p>
            <a href="#programList" className="btn-gold">🎯 Explore Programs</a>
          </div>
        </div>
      </section>

      {/* ── Programs Section ── */}
      <main className="programs-section">
        {error && <p className="inline-error">{error}</p>}

        {/* Category Pills (Feature #2) */}
        <div className="category-pills" aria-label="Quick category filters">
          {[
            { label: 'All Programs', icon: '🎓', value: 'all' },
            { label: 'CCSICT', icon: '💻', value: 'College of CCSICT' },
            { label: 'Agriculture', icon: '🌾', value: 'College of Agriculture' },
            { label: 'Law', icon: '⚖️', value: 'College of Law' },
            { label: 'Business', icon: '📊', value: 'College of Business and Management' },
            { label: 'Education', icon: '📚', value: 'College of Education' },
            { label: 'Criminology', icon: '🛡️', value: 'College of Criminal and Justice Education' },
            { label: 'Polytechnic', icon: '⚙️', value: 'College of Polytechnic' },
          ].map(cat => (
            <button
              key={cat.label}
              type="button"
              className={`cat-pill ${collegeFilter === cat.value ? 'active' : ''}`}
              onClick={() => setCollegeFilter(cat.value)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <div className="search-bar" aria-label="Filter programs">
          <input
            id="searchInput"
            type="text"
            placeholder="Search Program..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            id="collegeFilter"
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value)}
          >
            <option value="all">All Colleges</option>
            {colleges.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <p id="programCount" className="program-count" aria-live="polite">
          Showing {filteredPrograms.length} of {programs.length} programs
        </p>

        <div id="programList" className="programs-grid">
          {filteredPrograms.length === 0 ? (
            <p className="empty-state">
              No results found. Try a different search or college filter.
            </p>
          ) : (
            filteredPrograms.map(p => (
              <ProgramCard key={p.id} program={p} onLocate={handleLocate} />
            ))
          )}
        </div>

        {/* ── Campus Map ── */}
        <Map ref={mapRef} locations={locations} />

        {/* ── About ── */}
        <section id="about" className="about-section" aria-label="About and contact">
          <h2>About and Contact</h2>
          <p>
            ISU Cauayan is one of the leading campuses of Isabela State University,
            offering programs in Information Technology, Agriculture, Political Science,
            Business, Education, and more. This platform helps students, guests, and
            faculty locate buildings and explore academic offerings.
          </p>
          <p><strong>Email:</strong> info@isucauayan.edu.ph</p>
          <p><strong>Location:</strong> Brgy. San Fermin, Cauayan City, Isabela</p>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Isabela State University — Cauayan Campus</p>
      </footer>
    </>
  );
}
