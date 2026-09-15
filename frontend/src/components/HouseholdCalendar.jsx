import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

const MEMBER_COLORS = ['#006078', '#E37C78', '#7A5C61', '#4D8B8B', '#A66A4C', '#5B6EAE'];
const SHARED_EVENT_COLOR = '#B88700';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfCalendar(date) {
  const monthStart = startOfMonth(date);
  const day = monthStart.getDay();
  const result = new Date(monthStart);
  result.setDate(monthStart.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDaysForMonth(date) {
  const firstDay = startOfCalendar(date);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstDay);
    day.setDate(firstDay.getDate() + index);
    return day;
  });
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function memberDisplayName(member) {
  return member?.name || member?.username || 'Ukjent';
}

export function colorForEvent(calendarEvent, members) {
  if (calendarEvent.eventType === 'Shared' || calendarEvent.eventType === 1) {
    return SHARED_EVENT_COLOR;
  }

  const memberIndex = members.findIndex((member) => member.id === calendarEvent.createdByUserId);
  return MEMBER_COLORS[(memberIndex < 0 ? 0 : memberIndex) % MEMBER_COLORS.length];
}

function EventForm({ householdId, onCreated }) {
  const [values, setValues] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    eventType: 'Personal'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiFetch(`/api/households/${householdId}/events`, {
        method: 'POST',
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          eventType: values.eventType === 'Shared' ? 1 : 0
        })
      });
      setValues({ title: '', description: '', startTime: '', endTime: '', eventType: 'Personal' });
      await onCreated();
    } catch (err) {
      setError(err.message || 'Kunne ikke legge til kalenderhendelsen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="calendar-event-form" onSubmit={handleSubmit}>
      <div className="calendar-form-heading">
        <h3>Legg til hendelse</h3>
        <span>Planlegg noe for husholdningen</span>
      </div>
      {error ? <div className="alert">{error}</div> : null}
      <input value={values.title} onChange={handleChange('title')} placeholder="Tittel" required />
      <textarea value={values.description} onChange={handleChange('description')} placeholder="Beskrivelse (valgfritt)" rows="2" />
      <div className="calendar-form-row">
        <label>
          Fra
          <input type="datetime-local" value={values.startTime} onChange={handleChange('startTime')} required />
        </label>
        <label>
          Til
          <input type="datetime-local" value={values.endTime} onChange={handleChange('endTime')} required />
        </label>
      </div>
      <div className="event-type-toggle" role="group" aria-label="Hendelsestype">
        {['Personal', 'Shared'].map((type) => (
          <button
            key={type}
            type="button"
            className={values.eventType === type ? 'selected' : ''}
            onClick={() => setValues((current) => ({ ...current, eventType: type }))}
          >
            {type === 'Personal' ? 'Personlig' : 'Delt'}
          </button>
        ))}
      </div>
      <button type="submit" disabled={saving}>{saving ? 'Lagrer…' : 'Legg til i kalender'}</button>
    </form>
  );
}

export default function HouseholdCalendar({ household, members }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const days = useMemo(() => getDaysForMonth(month), [month]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const from = startOfCalendar(month).toISOString();
      const to = endOfMonth(month).toISOString();
      const data = await apiFetch(`/api/households/${household.householdId}/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      setEvents(data ?? []);
      setError('');
    } catch (err) {
      setError(err.message || 'Kunne ikke laste kalenderen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household.householdId, month]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map();
    events.forEach((calendarEvent) => {
      const key = dateKey(new Date(calendarEvent.startTime));
      grouped.set(key, [...(grouped.get(key) ?? []), calendarEvent]);
    });
    return grouped;
  }, [events]);

  return (
    <section className="calendar-section" id="household-calendar">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Felles planlegging</p>
          <h2>Husholdningskalender</h2>
        </div>
        <div className="calendar-navigation">
          <button type="button" className="auth-button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>Forrige</button>
          <strong>{month.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' })}</strong>
          <button type="button" className="auth-button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>Neste</button>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-card">
          {error ? <div className="alert">{error}</div> : null}
          <div className="calendar-weekdays">
            {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid" aria-busy={loading}>
            {days.map((day) => {
              const dayEvents = eventsByDay.get(dateKey(day)) ?? [];
              const isCurrentMonth = day.getMonth() === month.getMonth();
              return (
                <div key={day.toISOString()} className={`calendar-day ${isCurrentMonth ? '' : 'outside-month'}`}>
                  <time dateTime={dateKey(day)}>{day.getDate()}</time>
                  <div className="calendar-day-events">
                    {dayEvents.map((calendarEvent) => (
                      <div
                        className="calendar-event"
                        key={calendarEvent.id}
                        style={{ '--event-color': colorForEvent(calendarEvent, members) }}
                        title={calendarEvent.description || calendarEvent.title}
                      >
                        {calendarEvent.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="calendar-sidebar">
          <EventForm householdId={household.householdId} onCreated={loadEvents} />
          <div className="calendar-legend">
            <h3>Fargeforklaring</h3>
            {members.map((member, index) => (
              <div className="calendar-legend-item" key={member.id}>
                <span className="calendar-swatch" style={{ background: MEMBER_COLORS[index % MEMBER_COLORS.length] }} />
                <span>{memberDisplayName(member)}</span>
              </div>
            ))}
            <div className="calendar-legend-item">
              <span className="calendar-swatch" style={{ background: SHARED_EVENT_COLOR }} />
              <span>Delt</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}