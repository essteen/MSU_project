import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api.js';
import { BellIcon } from './icons.jsx';

export default function NotificationBell() {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const containerRef = useRef(null);

  const loadRequests = async () => {
    try {
      const data = await apiFetch('/households/join-requests/pending');
      setRequests(data ?? []);
    } catch (err) {
      setError(err.message || 'Kunne ikke laste varsler');
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resolve = async (requestId, action) => {
    setResolvingId(requestId);
    try {
      await apiFetch(`/households/join-requests/${requestId}/${action}`, { method: 'POST' });
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Kunne ikke behandle forespørselen');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="bell-button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Varsler"
      >
        <BellIcon />
        {requests.length > 0 ? <span className="bell-badge">{requests.length}</span> : null}
      </button>

      {open ? (
        <div className="notification-dropdown">
          <h3>Varsler</h3>
          {error ? <div className="alert">{error}</div> : null}
          {requests.length === 0 ? (
            <p className="notification-empty">Ingen ventende forespørsler.</p>
          ) : (
            <ul>
              {requests.map((request) => (
                <li key={request.requestId} className="notification-item">
                  <p>
                    <strong>{request.username}</strong> vil bli med i <strong>{request.householdName}</strong>
                  </p>
                  <div className="notification-actions">
                    <button
                      type="button"
                      disabled={resolvingId === request.requestId}
                      onClick={() => resolve(request.requestId, 'approve')}
                    >
                      Godkjenn
                    </button>
                    <button
                      type="button"
                      className="reject-button"
                      disabled={resolvingId === request.requestId}
                      onClick={() => resolve(request.requestId, 'reject')}
                    >
                      Avslå
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
