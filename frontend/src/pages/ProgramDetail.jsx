import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProgram, mediaUrl } from '../services/api';
import Navbar from '../components/Navbar';
import './ProgramDetail.css';

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
        setError('Program not found or failed to load.');
        setLoading(false);
      });
  }, [slug]);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="pd-page-root">
        <div className="pd-page-wrap">
          <div className="pd-container">
            <Navbar />
          </div>
        </div>
        <div className="pd-state-wrap">
          <div className="pd-loading-inner">
            <div className="pd-spinner" />
            <p>Loading program details…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error || !program) {
    return (
      <div className="pd-page-root">
        <div className="pd-page-wrap">
          <div className="pd-container">
            <Navbar />
          </div>
        </div>
        <div className="pd-state-wrap">
          <div className="pd-error-card">
            <h2>Program Not Found</h2>
            <p>{error || "We couldn't locate the program you were looking for."}</p>
            <Link to="/" className="pd-btn-primary">← Return to Campus Map</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Derived Data ── */
  const locationName = program.location_details?.name || 'Campus Building';
  const routeUrl     = `/?routeTo=${encodeURIComponent(locationName)}`;
  const campusFallbackImage = mediaUrl('media/images-programs/secondary.jpg');
  const logoFallbackImage = mediaUrl('media/images-programs/isulogo.png');
  const campusImageUrl = program.location_details?.image_url || campusFallbackImage;
  const collegeLogoUrl = program.image_url || logoFallbackImage;

  const careerOutcomesList = (program.career_outcomes && program.career_outcomes.length > 0)
    ? program.career_outcomes
    : [
        `${program.name} Specialist`,
        'Industry & Research Consultant',
        'Technical Operations Manager',
        'Department Supervisor',
        'Field Practitioner & Analyst',
      ];

  /* ── Main Render ── */
  return (
    <div className="pd-page-root">

      {/* ── White Navbar Bar ── */}
      <div className="pd-page-wrap">
        <div className="pd-container">
          <Navbar />
        </div>
      </div>

      {/* ── Back Link + Hero ── */}
      <div className="pd-page-wrap" style={{ borderBottom: 'none', boxShadow: 'none' }}>
        <div className="pd-container">

          {/* Back Link */}
          <div className="pd-back-bar">
            <Link className="pd-back-link" to={routeUrl}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              Back to Campus Map
            </Link>
          </div>

          {/* Hero 2-Column */}
          <section className="pd-hero">
            <div className="pd-hero-grid">

              {/* LEFT — Text */}
              <div className="pd-hero-left">
                 <span className="pd-badge">Academic Program</span>

                <h1 className="pd-hero-title">{program.name}</h1>

                <p className="pd-hero-subtitle">
                  {program.subtitle || program.college}
                </p>

                <p className="pd-hero-desc">
                  {program.description
                    || `A program that develops highly skilled graduates ready to contribute to industry, research, and public service through the ${program.college} at Isabela State University — Cauayan Campus.`}
                </p>

                <div className="pd-hero-actions">
                  <Link className="pd-btn-primary" to={routeUrl}>
                     Locate Building on Map
                  </Link>
                  <a className="pd-btn-secondary" href="#pd-overview">
                    Learn More →
                  </a>
                </div>
              </div>

              {/* RIGHT — Image Card */}
              <div className="pd-hero-right">
                <div className="pd-image-card">
                  {/* Campus/Building Image */}
                  <img
                    className="pd-campus-img"
                    src={campusImageUrl}
                    alt={`${program.name} campus building`}
                    onError={(e) => { e.target.src = campusFallbackImage; }}
                  />

                  {/* College Logo — top-left corner overlay */}
                  <div className="pd-logo-overlay">
                    <img
                      src={collegeLogoUrl}
                      alt={`${program.college} logo`}
                      onError={(e) => { e.target.src = logoFallbackImage; }}
                    />
                  </div>

                  {/* Campus Location Pill — bottom overlay */}
                  <div className="pd-location-pill">
                    <div>
                      <div className="pd-location-pill-label">Campus Location</div>
                      <div className="pd-location-pill-name">{locationName}</div>
                      <div className="pd-location-pill-campus">ISU Cauayan Campus</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="pd-container">
        <div className="pd-info-strip-wrap">
          <div className="pd-info-strip">
            <div className="pd-info-item">
              <div>
                <div className="pd-info-label">College / Department</div>
                <div className="pd-info-value">{program.college}</div>
              </div>
            </div>

            <div className="pd-info-item">
              <div className="pd-info-icon pd-icon-duration">⏱️</div>
              <div>
                <div className="pd-info-label">Program Duration</div>
                <div className="pd-info-value">{program.duration || '4 Years'}</div>
              </div>
            </div>

            <div className="pd-info-item">
              <div>
                <div className="pd-info-label">Learning Format</div>
                <div className="pd-info-value">{program.program_type || program.learning_format || 'On-campus'}</div>
              </div>
            </div>

            <div className="pd-info-item">
              <div>
                <div className="pd-info-label">Building / Facility</div>
                <div className="pd-info-value">{locationName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="pd-main" id="pd-overview">
        <div className="pd-container">
          <div className="pd-content-grid">

            {/* LEFT COLUMN */}
            <div>
              {/* Program Overview */}
              <div className="pd-card">
                <div className="pd-card-head">
                  <h2>Program Overview</h2>
                </div>
                <div className="pd-card-body">
                  <div className="pd-divider" />
                  <p className="pd-overview-text">
                    {program.description
                      || `The ${program.name} at ISU Cauayan prepares students with essential theoretical knowledge, practical expertise, and modern industry standards.`}
                  </p>

                  <div className="pd-outcomes-list">
                    <div className="pd-outcome-row">
                      <div className="pd-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                      <span>Understand core principles and theoretical frameworks of the discipline</span>
                    </div>
                    <div className="pd-outcome-row">
                      <div className="pd-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                      <span>Apply knowledge to real-world professional and industry scenarios</span>
                    </div>
                    <div className="pd-outcome-row">
                      <div className="pd-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                      <span>Develop leadership, communication, and civic engagement skills</span>
                    </div>
                    <div className="pd-outcome-row">
                      <div className="pd-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                      <span>Pursue lifelong learning and graduate studies or professional licensure</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="pd-features-grid">
                      <div className="pd-feature-item">
                        <div>
                          <strong>Hands-on Training</strong>
                          <p>Equipped with state-of-the-art laboratory and practical workshops.</p>
                        </div>
                      </div>
                      <div className="pd-feature-item">
                        <div>
                          <strong>Industry Internship</strong>
                          <p>Includes On-the-Job (OJT) partnerships with top organizations.</p>
                        </div>
                      </div>
                      <div className="pd-feature-item">
                        <div>
                          <strong>Modern Curriculum</strong>
                          <p>Continuously updated to match local and international standards.</p>
                        </div>
                      </div>
                      <div className="pd-feature-item">
                        <div>
                          <strong>Expert Mentorship</strong>
                          <p>Guided by licensed faculty and experienced industry practitioners.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* Location Card */}
              <div className="pd-card">
                <div className="pd-card-head">
                  <h2>Location & Campus Building</h2>
                </div>
                <div className="pd-card-body">
                  <div className="pd-location-card-inner">
                    <h3>{locationName}</h3>
                    <p className="pd-location-meta">
                      Category: <span>{program.location_details?.type || 'Campus Facility'}</span>
                    </p>
                    {program.location_details?.description && (
                      <p className="pd-location-desc-text">{program.location_details.description}</p>
                    )}
                  </div>
                  <Link className="pd-btn-primary pd-btn-full" to={routeUrl}>
                     View Route on Campus Map
                  </Link>
                </div>
              </div>

              {/* Admission Requirements */}
              <div className="pd-card">
                <div className="pd-card-head">
                  <h2>General Requirements</h2>
                </div>
                <div className="pd-card-body">
                  <ul className="pd-req-list">
                    <li>
                      <span className="pd-req-dot" />
                      <span>High School / Senior High Report Card (Form 138)</span>
                    </li>
                    <li>
                      <span className="pd-req-dot" />
                      <span>Certificate of Good Moral Character</span>
                    </li>
                    <li>
                      <span className="pd-req-dot" />
                      <span>ISU College Entrance Examination (CEE) Results</span>
                    </li>
                    <li>
                      <span className="pd-req-dot" />
                      <span>PSA Birth Certificate Copy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* ── Full Width Career Outcomes & Pathways Card ── */}
          <div className="pd-card" style={{ marginTop: '28px' }}>
            <div className="pd-card-head">
              <h2>Career Outcomes & Pathways</h2>
            </div>
            <div className="pd-card-body">
              <p style={{ fontSize: '0.94rem', color: 'var(--pd-muted)', margin: '0 0 16px' }}>
                Graduates of <strong>{program.name}</strong> are well-equipped to excel in a variety of professional roles:
              </p>
              <div className="pd-chips-wrap">
                {careerOutcomesList.map((outcome, idx) => (
                  <div key={idx} className="pd-chip">
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA Banner ── */}
          <div className="pd-cta-banner">
            <div className="pd-cta-content">
              <h2>Ready to Explore Campus Buildings?</h2>
              <p>
                Locate the <strong>{locationName}</strong> on our interactive 3D map and view turn-by-turn navigation.
              </p>
            </div>
            <div className="pd-cta-actions">
              <Link className="pd-btn-cta-white" to={routeUrl}>
                Open Interactive Map
              </Link>
              <Link className="pd-btn-cta-ghost" to="/">
                Browse All Programs
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="pd-footer">
        © 2026 Isabela State University — Cauayan Campus
      </footer>

    </div>
  );
}
