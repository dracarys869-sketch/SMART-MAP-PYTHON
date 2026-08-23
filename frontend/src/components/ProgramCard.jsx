import { Link } from 'react-router-dom';

export default function ProgramCard({ program, onLocate }) {
  const locationName = program.location_details?.name || 'Campus Building';

  return (
    <article className="program-card">
      <Link to={`/programs/${program.slug}`} className="program-logo-link" aria-label={`View details for ${program.name}`}>
        <img
          className="program-logo"
          src={program.image_url || '/images/ict.png'}
          alt={program.name}
          onError={(e) => { e.target.src = '/images/ict.png'; }}
        />
      </Link>

      <div className="program-body">
        <Link to={`/programs/${program.slug}`} className="program-name-link">
          <h3>{program.name}</h3>
        </Link>

        <p className="program-college">🏛️ {program.college}</p>
        <p className="program-location">📍 {locationName}</p>

        <div className="program-chips">
          <span className="chip">🎓 {program.program_type || 'On-campus'}</span>
          <span className="chip">⏱️ {program.duration || '4 Years'}</span>
        </div>

        <div className="program-card-actions">
          <Link to={`/programs/${program.slug}`} className="btn-card-detail">
            View Details →
          </Link>
          <button
            className="btn-locate"
            type="button"
            aria-label={`Locate ${program.name} on map`}
            onClick={() => {
              if (onLocate) onLocate(locationName);
            }}
          >
            📍 Locate
          </button>
        </div>
      </div>
    </article>
  );
}
