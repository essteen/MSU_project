import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

const EXPENSE_COLORS = ['#006078', '#82BAC4', '#E37C78', '#FFD4D1', '#1F2A2E', '#DFF3F8'];
const MEMBER_EMOJIS = ['🦊', '🐼', '🐸', '🐨', '🐰', '🐯', '🐷', '🐵', '🐶', '🐱', '🐮', '🐭'];

function emojiForMember(memberId) {
  const hash = String(memberId)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return MEMBER_EMOJIS[hash % MEMBER_EMOJIS.length];
}

function memberDisplayName(member) {
  return member?.name || member?.username || 'Ukjent';
}

function MemberAvatar({ member }) {
  return (
    <div className="member-chip">
      <div className="member-emoji" aria-hidden="true">{emojiForMember(member.id)}</div>
      <span className="member-name">{memberDisplayName(member)}</span>
    </div>
  );
}

function ItemPreviewList({ items, renderRight, onSelectItem }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);
  const hiddenCount = items.length - 3;

  return (
    <>
      <ul className="mini-box-preview">
        {visibleItems.map((item) => (
          <li
            key={item.id}
            className="clickable-row"
            onClick={(event) => { event.stopPropagation(); onSelectItem(item); }}
          >
            <strong>{item.name}</strong>
            {renderRight(item)}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mini-box-toggle"
          onClick={(event) => { event.stopPropagation(); setExpanded((current) => !current); }}
        >
          {expanded ? 'Vis mindre' : `Vis resten av listen (${hiddenCount})`}
        </button>
      ) : null}
    </>
  );
}

function ExpensesChart({ spenders }) {
  const total = spenders.reduce((sum, spender) => sum + spender.amount, 0);

  if (total === 0) {
    return <p className="expenses-empty">Ingen utgifter registrert ennå.</p>;
  }

  let cumulativePercent = 0;
  const gradientStops = spenders
    .map((spender, index) => {
      const percent = (spender.amount / total) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      return `${EXPENSE_COLORS[index % EXPENSE_COLORS.length]} ${start}% ${cumulativePercent}%`;
    })
    .join(', ');

  return (
    <div className="expenses-chart-wrap">
      <div className="expenses-pie" style={{ background: `conic-gradient(${gradientStops})` }} />
      <ul className="expenses-legend">
        {spenders.map((spender, index) => (
          <li key={spender.name}>
            <span className="expenses-swatch" style={{ background: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }} />
            <span className="expenses-name">{spender.name}</span>
            <span className="expenses-amount">{spender.amount} kr</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemDetailModal({ title, rows, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

        <ul className="detail-rows">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="detail-label">{row.label}</span>
              <span className="detail-value">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AddChoiceModal({ title, onClose, onChooseManual, onChooseReceipt }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

        <div className="add-choice-list">
          <button type="button" className="add-choice-button" onClick={onChooseManual}>
            <strong>Legg til manuelt</strong>
            <span>Skriv inn varenavn og pris selv</span>
          </button>
          <button type="button" className="add-choice-button" onClick={onChooseReceipt}>
            <strong>Legg til via kvittering</strong>
            <span>Last opp bilde av kvittering</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptPlaceholderModal({ onClose, onSwitchToManual }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Legg til via kvittering</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

        <p>Automatisk gjenkjenning av kvitteringer kommer senere. Da vil du kunne laste opp et bilde, og feltene fylles ut automatisk.</p>

        <button type="button" onClick={onSwitchToManual}>Legg til manuelt i mellomtiden</button>
      </div>
    </div>
  );
}

function ItemPanelModal({ title, fields, onClose, onAddItem, error }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, '']))
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.name?.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await onAddItem(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="stacked-form panel-add-form">
          {fields.map((field) => (
            <input
              key={field.key}
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              value={values[field.key] ?? ''}
              onChange={handleChange(field.key)}
              required={field.required}
            />
          ))}
          <button type="submit" disabled={submitting}>{submitting ? 'Legger til…' : 'Legg til'}</button>
        </form>
      </div>
    </div>
  );
}

export default function HouseholdPage({ household, currentUser, onBack }) {
  const members = household?.members ?? [];

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedPurchasedItem, setSelectedPurchasedItem] = useState(null);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/items');
      setPurchasedItems((data ?? []).filter((item) => item.householdId === household.householdId));
      setError('');
    } catch (err) {
      setError(err.message || 'Kunne ikke laste kjøpte varer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household.householdId]);

  const addPurchasedItem = async (values) => {
    setAddError('');
    try {
      await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          category: 0,
          price: values.price ? Number(values.price) : 0,
          ownerId: currentUser.id,
          householdId: household.householdId
        })
      });
      await loadItems();
    } catch (err) {
      setAddError(err.message || 'Kunne ikke legge til vare');
      throw err;
    }
  };

  const addWishlistItem = (values) => {
    setWishlistItems((current) => [
      {
        id: `w${Date.now()}`,
        name: values.name,
        url: values.url,
        addedBy: currentUser?.name || currentUser?.username || 'Deg'
      },
      ...current
    ]);
  };

  const spenders = useMemo(() => {
    const totals = new Map();
    purchasedItems.forEach((item) => {
      const name = memberDisplayName(item.owner);
      totals.set(name, (totals.get(name) ?? 0) + (item.price ?? 0));
    });
    return [...totals.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [purchasedItems]);

  return (
    <div className="household-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Husholdningsoversikt</p>
          <h1>{household?.name ?? 'Min husholdning'}</h1>
        </div>
        {onBack ? (
          <button type="button" className="auth-button" onClick={onBack}>← Tilbake</button>
        ) : null}
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="household-layout">
        <article className="card members-panel">
          <h2>Medlemmer</h2>
          <div className="members-grid-wrap">
            <div className="members-grid">
              {members.map((member) => (
                <MemberAvatar key={member.id} member={member} />
              ))}
            </div>
          </div>
        </article>

        <article
          className="card mini-box purchased-box"
          role="button"
          tabIndex={0}
          onClick={() => setOpenPanel('purchased-choice')}
          onKeyDown={(event) => event.key === 'Enter' && setOpenPanel('purchased-choice')}
        >
          <div className="mini-box-header">
            <h3>Kjøpte varer</h3>
            <span className="badge">{purchasedItems.length}</span>
          </div>
          {loading ? <p>Laster…</p> : (
            <ItemPreviewList
              items={purchasedItems}
              renderRight={(item) => <span>{item.price ? `${item.price} kr` : ''}</span>}
              onSelectItem={setSelectedPurchasedItem}
            />
          )}
          <span className="mini-box-cta">+ Legg til vare</span>
        </article>

        <article
          className="card mini-box wishlist-box"
          role="button"
          tabIndex={0}
          onClick={() => setOpenPanel('wishlist')}
          onKeyDown={(event) => event.key === 'Enter' && setOpenPanel('wishlist')}
        >
          <div className="mini-box-header">
            <h3>Ønskeliste</h3>
            <span className="badge">{wishlistItems.length}</span>
          </div>
          <ItemPreviewList
            items={wishlistItems}
            renderRight={(item) =>
              item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                  Se produkt
                </a>
              ) : null
            }
            onSelectItem={setSelectedWishlistItem}
          />
          <span className="mini-box-cta">+ Legg til i ønskeliste</span>
        </article>

        <article className="card mini-box expenses-box">
          <div className="mini-box-header">
            <h3>Utgifter</h3>
          </div>
          <p className="expenses-subtitle">Hvem har brukt mest penger i husholdningen</p>
          <ExpensesChart spenders={spenders} />
        </article>
      </section>

      {openPanel === 'purchased-choice' ? (
        <AddChoiceModal
          title="Kjøpte varer"
          onClose={() => setOpenPanel(null)}
          onChooseManual={() => setOpenPanel('purchased')}
          onChooseReceipt={() => setOpenPanel('purchased-receipt')}
        />
      ) : null}

      {openPanel === 'purchased-receipt' ? (
        <ReceiptPlaceholderModal
          onClose={() => setOpenPanel(null)}
          onSwitchToManual={() => setOpenPanel('purchased')}
        />
      ) : null}

      {openPanel === 'purchased' ? (
        <ItemPanelModal
          title="Kjøpte varer"
          onClose={() => setOpenPanel(null)}
          onAddItem={addPurchasedItem}
          error={addError}
          fields={[
            { key: 'name', placeholder: 'Varenavn', required: true },
            { key: 'price', placeholder: 'Pris', type: 'number' }
          ]}
        />
      ) : null}

      {openPanel === 'wishlist' ? (
        <ItemPanelModal
          title="Ønskeliste"
          onClose={() => setOpenPanel(null)}
          onAddItem={addWishlistItem}
          fields={[
            { key: 'name', placeholder: 'Varenavn', required: true },
            { key: 'url', placeholder: 'Lenke til produkt (valgfritt)', type: 'url' }
          ]}
        />
      ) : null}

      {selectedPurchasedItem ? (
        <ItemDetailModal
          title={selectedPurchasedItem.name}
          onClose={() => setSelectedPurchasedItem(null)}
          rows={[
            { label: 'Pris', value: selectedPurchasedItem.price ? `${selectedPurchasedItem.price} kr` : '—' },
            { label: 'Kjøpt av', value: memberDisplayName(selectedPurchasedItem.owner) }
          ]}
        />
      ) : null}

      {selectedWishlistItem ? (
        <ItemDetailModal
          title={selectedWishlistItem.name}
          onClose={() => setSelectedWishlistItem(null)}
          rows={[
            {
              label: 'Lenke',
              value: selectedWishlistItem.url ? (
                <a href={selectedWishlistItem.url} target="_blank" rel="noreferrer">Se produkt</a>
              ) : '—'
            },
            { label: 'Lagt til av', value: selectedWishlistItem.addedBy }
          ]}
        />
      ) : null}
    </div>
  );
}
