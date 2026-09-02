import React, { useMemo, useState } from 'react';

const EXPENSE_COLORS = ['#006078', '#82BAC4', '#E37C78', '#FFD4D1', '#1F2A2E', '#DFF3F8'];

const MOCK_MEMBERS = [
  { id: 'm1', name: 'Emilie', emoji: '🦊' },
  { id: 'm2', name: 'Jonas', emoji: '🐼' },
  { id: 'm3', name: 'Sara', emoji: '🐸' },
  { id: 'm4', name: 'Noah', emoji: '🐨' }
];

const MOCK_PURCHASED_ITEMS = [
  { id: 'p1', name: 'Melk', price: 24, addedBy: 'Emilie' },
  { id: 'p2', name: 'Oppvasktabletter', price: 89, addedBy: 'Jonas' },
  { id: 'p3', name: 'Toalettpapir', price: 65, addedBy: 'Sara' }
];

const MOCK_WISHLIST_ITEMS = [
  { id: 'w1', name: 'Ny støvsuger', url: '', addedBy: 'Noah' },
  { id: 'w2', name: 'Kaffetrakter', url: 'https://www.komplett.no', addedBy: 'Emilie' }
];

function MemberAvatar({ member }) {
  return (
    <div className="member-chip">
      <div className="member-emoji" aria-hidden="true">{member.emoji}</div>
      <span className="member-name">{member.name}</span>
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

function ItemPanelModal({ title, fields, onClose, onAddItem }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, '']))
  );

  const handleChange = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.name?.trim()) {
      return;
    }
    onAddItem(values);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

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
          <button type="submit">Legg til</button>
        </form>
      </div>
    </div>
  );
}

export default function HouseholdPage({ household, onBack }) {
  const members = household?.members?.length ? household.members : MOCK_MEMBERS;

  const [purchasedItems, setPurchasedItems] = useState(MOCK_PURCHASED_ITEMS);
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST_ITEMS);
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedPurchasedItem, setSelectedPurchasedItem] = useState(null);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);

  const addPurchasedItem = (values) => {
    setPurchasedItems((current) => [
      {
        id: `p${Date.now()}`,
        name: values.name,
        price: values.price ? Number(values.price) : undefined,
        addedBy: 'Deg'
      },
      ...current
    ]);
  };

  const addWishlistItem = (values) => {
    setWishlistItems((current) => [
      { id: `w${Date.now()}`, name: values.name, url: values.url, addedBy: 'Deg' },
      ...current
    ]);
  };

  const spenders = useMemo(() => {
    const totals = new Map();
    purchasedItems.forEach((item) => {
      const amount = item.price ?? 0;
      totals.set(item.addedBy, (totals.get(item.addedBy) ?? 0) + amount);
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
          onClick={() => setOpenPanel('purchased')}
          onKeyDown={(event) => event.key === 'Enter' && setOpenPanel('purchased')}
        >
          <div className="mini-box-header">
            <h3>Kjøpte varer</h3>
            <span className="badge">{purchasedItems.length}</span>
          </div>
          <ItemPreviewList
            items={purchasedItems}
            renderRight={(item) => <span>{item.price ? `${item.price} kr` : ''}</span>}
            onSelectItem={setSelectedPurchasedItem}
          />
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

      {openPanel === 'purchased' ? (
        <ItemPanelModal
          title="Kjøpte varer"
          onClose={() => setOpenPanel(null)}
          onAddItem={addPurchasedItem}
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
            { label: 'Kjøpt av', value: selectedPurchasedItem.addedBy }
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
