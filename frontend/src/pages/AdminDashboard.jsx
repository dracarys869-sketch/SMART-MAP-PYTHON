import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPrograms, createProgram, updateProgram, deleteProgram, uploadProgramImage,
  getLocations, createLocation, updateLocation, deleteLocation, uploadLocationImage,
  login, logout,
} from '../services/api';

const AUTH_KEY = 'isu-auth';
const getAuth = () => JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getAuth());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [programs, setPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgError, setMsgError] = useState(false);

  // Location form state
  const [newLoc, setNewLoc] = useState({ name: '', latitude: '', longitude: '', type: 'landmark', description: '' });

  // Program edit state
  const [editingProgram, setEditingProgram] = useState(null);

  // Location edit state
  const [editingLocation, setEditingLocation] = useState(null);

  // Action loading state
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const notify = (text, isError = false) => {
    setMsg(text);
    setMsgError(isError);
    setTimeout(() => setMsg(''), 4000);
  };

  const load = async () => {
    try {
      const [pRes, lRes] = await Promise.all([getPrograms(), getLocations()]);
      setPrograms(pRes.data);
      setLocations(lRes.data);
    } catch (err) {
      notify('Failed to load data: ' + (err.response?.data?.detail || err.message), true);
    }
  };

  useEffect(() => {
    if (auth?.user?.role === 'admin') {
      load();
    }
  }, [auth]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login(username, password);
      const data = res.data;
      if (data.user?.role !== 'admin') {
        setLoginError('This account does not have administrator access.');
        return;
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      setAuth(data);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
  };

  const handleLogout = async () => {
    const currentAuth = getAuth();
    try {
      if (currentAuth?.refresh) await logout(currentAuth.refresh);
    } catch (_) { /* ignore blacklist errors */ }
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
    navigate('/');
  };

  // ── Programs ──────────────────────────────────────────────────────────────
  const handleSaveProgram = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setLoadingMsg('Saving program changes...');
    try {
      await updateProgram(editingProgram.id, {
        name: editingProgram.name,
        college: editingProgram.college,
        subtitle: editingProgram.subtitle,
        description: editingProgram.description,
        duration: editingProgram.duration,
        learning_format: editingProgram.learning_format,
        program_type: editingProgram.program_type,
        slug: editingProgram.slug,
        location: editingProgram.location,
        career_outcomes: editingProgram.career_outcomes,
      });
      setEditingProgram(null);
      await load();
      notify('Program saved successfully.');
    } catch (err) {
      notify('Failed to save program: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    setActionLoading(true);
    setLoadingMsg('Deleting program...');
    try {
      await deleteProgram(id);
      await load();
      notify('Program deleted successfully.');
    } catch (err) {
      notify('Failed to delete program: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  const handleImageUpload = async (programId, file) => {
    const fd = new FormData();
    fd.append('image', file);
    setActionLoading(true);
    setLoadingMsg('Uploading program image...');
    try {
      await uploadProgramImage(programId, fd);
      await load();
      notify('Program image uploaded.');
    } catch (err) {
      notify('Image upload failed: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  // ── Locations ─────────────────────────────────────────────────────────────
  const handleAddLocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setLoadingMsg('Adding new location...');
    try {
      await createLocation(newLoc);
      setNewLoc({ name: '', latitude: '', longitude: '', type: 'landmark', description: '' });
      await load();
      notify('Location added successfully.');
    } catch (err) {
      notify('Failed to add location: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setLoadingMsg('Saving location changes...');
    try {
      await updateLocation(editingLocation.id, {
        name: editingLocation.name,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        type: editingLocation.type,
        description: editingLocation.description,
      });
      setEditingLocation(null);
      await load();
      notify('Location saved successfully.');
    } catch (err) {
      notify('Failed to save location: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    setActionLoading(true);
    setLoadingMsg('Deleting location...');
    try {
      await deleteLocation(id);
      await load();
      notify('Location deleted successfully.');
    } catch (err) {
      notify('Failed to delete location: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  const handleLocationImageUpload = async (locationId, file) => {
    const fd = new FormData();
    fd.append('image', file);
    setActionLoading(true);
    setLoadingMsg('Uploading location photo...');
    try {
      await uploadLocationImage(locationId, fd);
      await load();
      notify('Location photo uploaded successfully!');
    } catch (err) {
      notify('Location photo upload failed: ' + (err.response?.data?.detail || err.message), true);
    } finally {
      setActionLoading(false);
      setLoadingMsg('');
    }
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!auth || auth.user?.role !== 'admin') {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <a href="/" className="admin-back-link">← Back to Campus Map</a>
            <span className="admin-badge">ADMINISTRATION</span>
            <h2>Administrator Login</h2>
            <p>Access the campus discovery platform management dashboard</p>
          </div>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="adminUsername">Username</label>
              <input
                id="adminUsername"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p className="admin-login-error">{loginError}</p>}
            <button className="btn-admin-submit" type="submit">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const collegesCount = [...new Set(programs.map(p => p.college))].length;

  return (
    <div className="admin-dash-page">
      {actionLoading && (
        <div className="dash-loading-overlay" role="status" aria-live="polite">
          <div className="dash-loading-spinner" />
          <span>{loadingMsg || 'Processing changes...'}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="admin-dash-top">
        <div className="admin-dash-brand">
          <img src="http://127.0.0.1:8000/media/images-programs/isulogo.png" alt="Isabela State University logo" />
          <div className="admin-brand-text">
            <div className="admin-brand-main">ISABELA STATE UNIVERSITY</div>
            <div className="admin-brand-sub">Cauayan campus Admin</div>
          </div>
        </div>
        <div className="admin-dash-nav-actions">
          <a href="/" className="btn-dash-link">View Campus Map</a>
          <button className="btn-dash-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="admin-dash-container">
        <div className="admin-dash-header">
          <div>
            <h1>Management Dashboard</h1>
            <p>Configure campus academic programs, map locations, and data</p>
          </div>
        </div>

        {/* Feature #7: Analytics Stat Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🎓</span>
            <div className="stat-info">
              <h3>{programs.length}</h3>
              <p>Academic Programs</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏢</span>
            <div className="stat-info">
              <h3>{locations.length}</h3>
              <p>Campus Buildings & Gates</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏛️</span>
            <div className="stat-info">
              <h3>{collegesCount}</h3>
              <p>Colleges Offered</p>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`dash-toast ${msgError ? 'toast-error' : 'toast-success'}`}>
            {msg}
          </div>
        )}

        {/* ── Programs Section ── */}
        <section className="dash-card">
          <div className="dash-card-header">
            <h2>Academic Programs</h2>
            <span className="dash-count-badge">{programs.length} Programs</span>
          </div>

          {editingProgram ? (
            <form className="dash-editor-form" onSubmit={handleSaveProgram}>
              <h3>Editing: {editingProgram.name}</h3>

              <div className="dash-form-grid">
                <div className="form-group">
                  <label>Program Name</label>
                  <input
                    value={editingProgram.name || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <input
                    value={editingProgram.college || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, college: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input
                    value={editingProgram.slug || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, slug: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    value={editingProgram.duration || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Learning Format</label>
                  <input
                    value={editingProgram.learning_format || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, learning_format: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Program Type</label>
                  <input
                    value={editingProgram.program_type || ''}
                    onChange={e => setEditingProgram({ ...editingProgram, program_type: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Campus Location</label>
                <select
                  value={editingProgram.location || ''}
                  onChange={e => setEditingProgram({ ...editingProgram, location: Number(e.target.value) })}
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  value={editingProgram.subtitle || ''}
                  onChange={e => setEditingProgram({ ...editingProgram, subtitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProgram.description || ''}
                  onChange={e => setEditingProgram({ ...editingProgram, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Career Outcomes (separated by |)</label>
                <input
                  placeholder="e.g. Software Engineer | Data Analyst"
                  value={(editingProgram.career_outcomes || []).join('|')}
                  onChange={e => setEditingProgram({
                    ...editingProgram,
                    career_outcomes: e.target.value.split('|').map(x => x.trim()).filter(Boolean)
                  })}
                />
              </div>

              <div className="form-group">
                <label>Program Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files[0] && handleImageUpload(editingProgram.id, e.target.files[0])}
                />
              </div>

              <div className="dash-form-actions">
                <button className="btn-dash-save" type="submit">Save Changes</button>
                <button className="btn-dash-cancel" type="button" onClick={() => setEditingProgram(null)}>Cancel</button>
              </div>
            </form>
          ) : (
            <ul className="dash-item-list">
              {programs.map(p => (
                <li key={p.id} className="dash-item">
                  <div className="dash-item-info">
                    <strong>{p.name}</strong>
                    <span className="dash-item-meta">{p.college}</span>
                  </div>
                  <div className="dash-item-actions">
                    <button className="btn-item-edit" onClick={() => setEditingProgram(p)}>Edit</button>
                    <button className="btn-item-delete" onClick={() => handleDeleteProgram(p.id)}>Delete</button>
                  </div>
                </li>
              ))}
              {programs.length === 0 && <li className="dash-empty">No programs configured.</li>}
            </ul>
          )}
        </section>

        {/* ── Locations Section ── */}
        <section className="dash-card">
          <div className="dash-card-header">
            <h2>Campus Locations</h2>
            <span className="dash-count-badge">{locations.length} Locations</span>
          </div>

          <form className="dash-create-form" onSubmit={handleAddLocation}>
            <h3>Add New Location</h3>
            <div className="dash-form-grid">
              <div className="form-group">
                <label>Location Name</label>
                <input
                  placeholder="e.g. Science Building"
                  value={newLoc.name}
                  onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  placeholder="e.g. 16.9385"
                  value={newLoc.latitude}
                  onChange={e => setNewLoc({ ...newLoc, latitude: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  placeholder="e.g. 121.7645"
                  value={newLoc.longitude}
                  onChange={e => setNewLoc({ ...newLoc, longitude: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={newLoc.type} onChange={e => setNewLoc({ ...newLoc, type: e.target.value })}>
                  <option value="landmark">Landmark</option>
                  <option value="college">College</option>
                  <option value="gate">Gate</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                placeholder="Brief description"
                value={newLoc.description}
                onChange={e => setNewLoc({ ...newLoc, description: e.target.value })}
              />
            </div>
            <button className="btn-dash-save" type="submit" style={{ marginTop: 12 }}>+ Add Location</button>
          </form>

          <ul className="dash-item-list" style={{ marginTop: 24 }}>
            {locations.map(l => (
              <li key={l.id} className="dash-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                {editingLocation?.id === l.id ? (
                  <form className="dash-editor-form" onSubmit={handleSaveLocation} style={{ margin: '8px 0' }}>
                    <h3>Editing: {l.name}</h3>
                    <div className="dash-form-grid">
                      <div className="form-group">
                        <label>Location Name</label>
                        <input
                          value={editingLocation.name || ''}
                          onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={editingLocation.type || 'landmark'}
                          onChange={e => setEditingLocation({ ...editingLocation, type: e.target.value })}
                        >
                          <option value="landmark">Landmark</option>
                          <option value="college">College</option>
                          <option value="gate">Gate</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Latitude</label>
                        <input
                          value={editingLocation.latitude || ''}
                          onChange={e => setEditingLocation({ ...editingLocation, latitude: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input
                          value={editingLocation.longitude || ''}
                          onChange={e => setEditingLocation({ ...editingLocation, longitude: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        placeholder="Brief description of the building"
                        value={editingLocation.description || ''}
                        onChange={e => setEditingLocation({ ...editingLocation, description: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>📷 Upload / Change Photo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {editingLocation.image_url && (
                          <img src={editingLocation.image_url} alt={editingLocation.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid #eaecf0' }} />
                        )}
                        <label className="btn-item-edit" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          📷 Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => e.target.files[0] && handleLocationImageUpload(l.id, e.target.files[0]).then(() => setEditingLocation(prev => ({ ...prev, image_url: prev.image_url })))}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="dash-form-actions">
                      <button className="btn-dash-save" type="submit">Save Changes</button>
                      <button className="btn-dash-cancel" type="button" onClick={() => setEditingLocation(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="dash-item-info">
                      {l.image_url ? (
                        <img src={l.image_url} alt={l.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #eaecf0' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#edf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏢</div>
                      )}
                      <div>
                        <strong>{l.name}</strong>
                        <span className="dash-item-meta"> ({l.type} · {l.latitude}, {l.longitude})</span>
                      </div>
                    </div>
                    <div className="dash-item-actions">
                      <button className="btn-item-edit" onClick={() => setEditingLocation(l)}>✏️ Edit</button>
                      <button className="btn-item-delete" onClick={() => handleDeleteLocation(l.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
            {locations.length === 0 && <li className="dash-empty">No locations configured.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}
