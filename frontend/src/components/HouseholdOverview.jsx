import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { HouseIcon, MemberIcons } from './icons.jsx';

function formatMemberCount(count) {
  return count === 1 ? '1 medlem' : `${count} medlemmer`;
}

export default function HouseholdOverview() {
  const [households, setHouseholds] = useState([]);
  const [allHouseholds, setAllHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [tab, setTab] = useState('create');
  const [householdName, setHouseholdName] = useState('');
  const [joiningId, setJoiningId] = useState(null);

  const loadMine = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/households/mine');
      setHouseholds(data ?? []);
      setError('');
    } catch (err) {
      setError(err.message || 'Kunne ikke laste husholdningene dine');
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      const data = await apiFetch('/households');
      setAllHouseholds(data ?? []);
    } catch (err) {
      setError(err.message || 'Kunne ikke laste husholdninger');
    }
  };

  useEffect(() => {
    loadMine();
  }, []);

  useEffect(() => {
    if (addPanelOpen && tab === 'join') {
      loadAll();
    }
  }, [addPanelOpen, tab]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/households', {
        method: 'POST',
        body: JSON.stringify({ name: householdName })
      });
      setHouseholdName('');
      setAddPanelOpen(false);
      await loadMine();
    } catch (err) {
      setError(err.message || 'Kunne ikke opprette husholdning');
    }
  };

  const handleJoin = async (householdId) => {
    setJoiningId(householdId);
    try {
      await apiFetch(`/households/${householdId}/join`, { method: 'POST' });
      await Promise.all([loadMine(), loadAll()]);
    } catch (err) {
      setError(err.message || 'Kunne ikke bli med i husholdningen');
    } finally {
      setJoiningId(null);
    }
  };

  const myHouseholdIds = new Set(households.map((h) => h.householdId));
  const joinableHouseholds = allHouseholds.filter((h) => !myHouseholdIds.has(h.householdId));

  return (
    <section>
      <header className="topbar">
        <div>
          <p className="eyebrow">Oversikt</p>
          <h1>Mine husholdninger</h1>
        </div>
        <button type="button" onClick={() => setAddPanelOpen((open) => !open)}>
          {addPanelOpen ? 'Lukk' : 'Legg til husholdning'}
        </button>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      {addPanelOpen ? (
        <article className="card add-household-panel">
          <div className="tab-row">
            <button
              type="button"
              className={tab === 'create' ? 'tab-button active' : 'tab-button'}
              onClick={() => setTab('create')}
            >
              Opprett ny
            </button>
            <button
              type="button"
              className={tab === 'join' ? 'tab-button active' : 'tab-button'}
              onClick={() => setTab('join')}
            >
              Bli med i eksisterende
            </button>
          </div>

          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="stacked-form">
              <input
                type="text"
                placeholder="Husholdningsnavn"
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
                required
              />
              <button type="submit">Opprett husholdning</button>
            </form>
          ) : (
            <div className="join-list">
              {joinableHouseholds.length === 0 ? (
                <p>Ingen andre husholdninger å bli med i akkurat nå.</p>
              ) : (
                <ul>
                  {joinableHouseholds.map((household) => (
                    <li key={household.householdId} className="list-row">
                      <div className="list-row-info">
                        <HouseIcon size={24} className="household-icon" />
                        <div>
                          <strong>{household.name}</strong>
                          <span>{formatMemberCount(household.members?.length ?? 0)}</span>
                          <MemberIcons count={household.members?.length ?? 0} />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={joiningId === household.householdId}
                        onClick={() => handleJoin(household.householdId)}
                      >
                        {joiningId === household.householdId ? 'Blir med…' : 'Bli med'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </article>
      ) : null}

      {loading ? (
        <p>Laster…</p>
      ) : households.length === 0 ? (
        <article className="card empty-state">
          <p>Du er ikke medlem av noen husholdning ennå.</p>
        </article>
      ) : (
        <div className="card-grid">
          {households.map((household) => (
            <article className="card household-card" key={household.householdId}>
              <div className="household-card-header">
                <HouseIcon className="household-icon" />
                <h2>{household.name}</h2>
              </div>
              <p>{formatMemberCount(household.members?.length ?? 0)}</p>
              <MemberIcons count={household.members?.length ?? 0} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
