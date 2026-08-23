import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProgram } from '../services/api';
import Navbar from '../components/Navbar';

export default function ProgramDetail() {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProgram(slug)
      .then(res => {
        setProgram(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Program not found or failed to load.");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="pd-page-root">
        <section className="pd-hero-compact">
          <Navbar />
        </section>
        <main className="pd-container pd-loading-state">
          <div className="pd-spinner"></div>
          <p>Loading program details...</p>
        </main>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="pd-page-root">
        <section className="pd-hero-compact">
          <Navbar />
        </section>
        <main className="pd-container">
          <div className="pd-error-card">
            <h2>Program Not Found</h2>
            <p>{error || "We couldn't locate the program you were looking for."}</p>
            <Link to="/" className="btn-pd-gold">
              ← Return to Campus Map & Programs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Generate fallback career outcomes if empty
  const careerOutcomesList = (program.career_outcomes && program.career_outcomes.length > 0)
    ? program.career_outcomes
    : [
        `${program.name} Specialist`,
        `Industry & Research Consultant`,
        `Technical Operations Manager`,
        `Department Supervisor`,
        `Field Practitioner & Analyst`
      ];

  const locationName = program.location_details?.name || 'Campus Building';
  const routeUrl = `/?routeTo=${encodeURIComponent(locationName)}`;

  return (
    <div className="pd-page-root">
      {/* ── Top Hero Header Section ── */}
      <header className="pd-hero-header">
        <div className="pd-hero-bg-shapes" aria-hidden="true">
          <div className="pd-shape pd-shape-1"></div>
          <div className="pd-shape pd-shape-2"></div>
        </div>

        <Navbar />

        <div className="pd-hero-content pd-container">
          <div className="pd-hero-navigation">
            <Link className="pd-back-pill" to={routeUrl}>
              <span className="pd-back-arrow">←</span>
              <span>Back to Campus Map</span>
            </Link>
          </div>

          <div className="pd-hero-grid">
            <div className="pd-hero-text">
              <div className="pd-badge-group">
                <span className="pd-badge pd-badge-gold">🎓 Academic Program</span>
                <span className="pd-badge pd-badge-glass">{program.college}</span>
              </div>

              <h1 className="pd-title">{program.name}</h1>

              <p className="pd-subtitle">
                {program.subtitle || program.description || `Comprehensive degree program offered by the ${program.college} at Isabela State University - Cauayan Campus.`}
              </p>

              <div className="pd-hero-actions">
                <Link className="btn-pd-gold" to={routeUrl}>
                  📍 Locate Building on Map
                </Link>
                <a href="#overview" className="btn-pd-ghost">
                  Learn Details ↓
                </a>
              </div>
            </div>

            <div className="pd-hero-media-wrapper">
              <div className="pd-media-card">
                <img
                  src={program.image_url || "/images/ict.png"}
                  alt={program.name}
                  className="pd-media-img"
                  onError={(e) => { e.target.src = "/images/ict.png"; }}
                />
                <div className="pd-media-glass-info">
                  <span className="pd-media-icon">📍</span>
                  <div>
                    <strong>Campus Location</strong>
                    <p>{locationName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="pd-container pd-main-body" id="overview">
        {/* ── Key Quick Stats Bar ── */}
        <section className="pd-stats-grid" aria-label="Key Statistics">
          <div className="pd-stat-card">
            <div className="pd-stat-icon-wrapper icon-college">🏛️</div>
            <div className="pd-stat-info">
              <span className="pd-stat-label">College / Department</span>
              <strong className="pd-stat-value">{program.college}</strong>
            </div>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-icon-wrapper icon-duration">⏱️</div>
            <div className="pd-stat-info">
              <span className="pd-stat-label">Program Duration</span>
              <strong className="pd-stat-value">{program.duration || '4 Years'}</strong>
            </div>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-icon-wrapper icon-format">🎓</div>
            <div className="pd-stat-info">
              <span className="pd-stat-label">Learning Format</span>
              <strong className="pd-stat-value">{program.program_type || program.learning_format || 'On-campus'}</strong>
            </div>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-icon-wrapper icon-location">📍</div>
            <div className="pd-stat-info">
              <span className="pd-stat-label">Building / Facility</span>
              <strong className="pd-stat-value">{locationName}</strong>
            </div>
          </div>
        </section>

        {/* ── 2-Column Content Layout ── */}
        <div className="pd-content-layout">
          {/* Left Column: Primary Details & Career Outcomes */}
          <div className="pd-left-col">
            {/* Program Description */}
            <section className="pd-section-card">
              <div className="pd-card-header">
                <span className="pd-header-icon">📖</span>
                <h2>Program Overview</h2>
              </div>
              <div className="pd-card-body">
                <p className="pd-lead-para">
                  {program.description || `The ${program.name} at ISU Cauayan prepares students with essential theoretical knowledge, practical expertise, and modern industry standards.`}
                </p>

                <h3 className="pd-subheading">Key Features & Highlights</h3>
                <div className="pd-features-grid">
                  <div className="pd-feature-item">
                    <span className="pd-feature-icon">⚡</span>
                    <div>
                      <strong>Hands-on Training</strong>
                      <p>Equipped with state-of-the-art laboratory and practical workshops.</p>
                    </div>
                  </div>

                  <div className="pd-feature-item">
                    <span className="pd-feature-icon">💼</span>
                    <div>
                      <strong>Industry Internship</strong>
                      <p>Includes On-the-Job (OJT) partnerships with top organizations.</p>
                    </div>
                  </div>

                  <div className="pd-feature-item">
                    <span className="pd-feature-icon">🔬</span>
                    <div>
                      <strong>Modern Curriculum</strong>
                      <p>Continuously updated to match local and international standards.</p>
                    </div>
                  </div>

                  <div className="pd-feature-item">
                    <span className="pd-feature-icon">🏆</span>
                    <div>
                      <strong>Expert Mentorship</strong>
                      <p>Guided by licensed faculty and experienced industry practitioners.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Career Outcomes */}
            <section className="pd-section-card">
              <div className="pd-card-header">
                <span className="pd-header-icon">🚀</span>
                <h2>Career Outcomes & Pathways</h2>
              </div>
              <div className="pd-card-body">
                <p className="pd-sub-text">
                  Graduates of <strong>{program.name}</strong> are well-equipped to excel in a variety of professional roles:
                </p>
                <div className="pd-outcomes-grid">
                  {careerOutcomesList.map((outcome, idx) => (
                    <div key={idx} className="pd-outcome-chip">
                      <span className="pd-check-icon">✓</span>
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Building Info, Admission & Action Sidebar */}
          <div className="pd-right-col">
            {/* Campus Location Card */}
            <section className="pd-section-card pd-sidebar-card pd-highlight-card">
              <div className="pd-card-header">
                <span className="pd-header-icon">📍</span>
                <h2>Location & Campus Building</h2>
              </div>
              <div className="pd-card-body">
                <div className="pd-location-box">
                  <h3>{locationName}</h3>
                  <p className="pd-location-type">
                    Category: <span>{program.location_details?.type || 'Campus Facility'}</span>
                  </p>
                  {program.location_details?.description && (
                    <p className="pd-location-desc">{program.location_details.description}</p>
                  )}
                </div>

                <Link className="btn-pd-gold btn-full-width" to={routeUrl}>
                  🗺️ View Route on Campus Map
                </Link>
              </div>
            </section>

            {/* Admission Checklist */}
            <section className="pd-section-card pd-sidebar-card">
              <div className="pd-card-header">
                <span className="pd-header-icon">📋</span>
                <h2>General Requirements</h2>
              </div>
              <div className="pd-card-body">
                <ul className="pd-requirements-list">
                  <li>
                    <span className="bullet-dot"></span>
                    <span>High School / Senior High Report Card (Form 138)</span>
                  </li>
                  <li>
                    <span className="bullet-dot"></span>
                    <span>Certificate of Good Moral Character</span>
                  </li>
                  <li>
                    <span className="bullet-dot"></span>
                    <span>ISU College Entrance Examination (CEE) Results</span>
                  </li>
                  <li>
                    <span className="bullet-dot"></span>
                    <span>PSA Birth Certificate Copy</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer CTA Banner ── */}
        <section className="pd-cta-banner">
          <div className="pd-cta-content">
            <h2>Ready to Explore Campus Buildings?</h2>
            <p>
              Locate the <strong>{locationName}</strong> on our interactive 3D map and view turn-by-turn navigation.
            </p>
          </div>
          <div className="pd-cta-actions">
            <Link className="btn-pd-gold" to={routeUrl}>
              📍 Open Interactive Map
            </Link>
            <Link className="btn-pd-ghost-dark" to="/">
              🎓 Browse All Programs
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Isabela State University — Cauayan Campus</p>
      </footer>
    </div>
  );
}
