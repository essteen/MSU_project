import React, { useEffect, useMemo, useRef, useState } from 'react';
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
            key={item.id ?? item.itemId}
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

function ItemDetailModal({ title, rows, onClose, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message || 'Kunne ikke fjerne varen');
      setDeleting(false);
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

        <ul className="detail-rows">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="detail-label">{row.label}</span>
              <span className="detail-value">{row.value}</span>
            </li>
          ))}
        </ul>

        {onDelete ? (
          confirming ? (
            <div className="detail-delete-confirm">
              <span>Er du sikker på at du vil fjerne denne varen?</span>
              <div className="detail-delete-actions">
                <button type="button" className="reject-button" disabled={deleting} onClick={handleConfirmDelete}>
                  {deleting ? 'Fjerner…' : 'Ja, fjern'}
                </button>
                <button type="button" className="modal-switch" disabled={deleting} onClick={() => setConfirming(false)}>
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="reject-button detail-delete-button" onClick={() => setConfirming(true)}>
              Fjern vare
            </button>
          )
        ) : null}
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

function ReceiptUploadModal({ onClose, onAddItem, onRemoveItem, onSwitchToManual }) {
  const [mode, setMode] = useState('choose'); // choose | upload | camera-live | camera-preview
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [addingIndex, setAddingIndex] = useState(null);
  const [addedItems, setAddedItems] = useState(new Map()); // index -> itemId
  const [undoingIndex, setUndoingIndex] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (mode !== 'camera-live') {
      return undefined;
    }

    let cancelled = false;
    setError('');

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Fikk ikke tilgang til kamera. Prøv å laste opp et bilde i stedet.');
          setMode('choose');
        }
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mode]);

  useEffect(() => () => stopCamera(), []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      setFile(new File([blob], 'kvittering.jpg', { type: 'image/jpeg' }));
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
      setMode('camera-preview');
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setMode('camera-live');
  };

  const handleScan = async (event) => {
    event.preventDefault();
    if (!file) {
      return;
    }
    setScanning(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await apiFetch('/api/receipts/scan', { method: 'POST', body: formData });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Kunne ikke lese kvitteringen');
    } finally {
      setScanning(false);
    }
  };

  const handleAddItem = async (item, index) => {
    setAddingIndex(index);
    try {
      const created = await onAddItem({ name: item.name, price: item.price });
      setAddedItems((current) => new Map(current).set(index, created?.itemId));
    } catch {
      // error already surfaced via the parent's addError state
    } finally {
      setAddingIndex(null);
    }
  };

  const handleUndoItem = async (index) => {
    const itemId = addedItems.get(index);
    if (itemId === undefined) {
      return;
    }
    setUndoingIndex(index);
    try {
      await onRemoveItem(itemId);
      setAddedItems((current) => {
        const next = new Map(current);
        next.delete(index);
        return next;
      });
    } catch {
      // error already surfaced via the parent's addError state
    } finally {
      setUndoingIndex(null);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Legg til via kvittering</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Lukk">×</button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {!result ? (
          <>
            {mode === 'choose' ? (
              <div className="add-choice-list">
                <button type="button" className="add-choice-button" onClick={() => setMode('upload')}>
                  <strong>Last opp bilde</strong>
                  <span>Velg et bilde av kvitteringen fra enheten din</span>
                </button>
                <button type="button" className="add-choice-button" onClick={() => setMode('camera-live')}>
                  <strong>Ta bilde av kvittering</strong>
                  <span>Bruk kameraet til å ta et bilde direkte</span>
                </button>
              </div>
            ) : null}

            {mode === 'upload' ? (
              <form onSubmit={handleScan} className="stacked-form">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
                <button type="submit" disabled={!file || scanning}>
                  {scanning ? 'Leser kvittering…' : 'Skann kvittering'}
                </button>
                <button type="button" className="modal-switch" onClick={() => setMode('choose')}>
                  Tilbake
                </button>
              </form>
            ) : null}

            {mode === 'camera-live' ? (
              <div className="camera-capture">
                <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
                <div className="camera-actions">
                  <button type="button" onClick={handleCapture}>Ta bilde</button>
                  <button type="button" className="modal-switch" onClick={() => setMode('choose')}>
                    Avbryt
                  </button>
                </div>
              </div>
            ) : null}

            {mode === 'camera-preview' ? (
              <div className="camera-capture">
                {previewUrl ? (
                  <img src={previewUrl} alt="Bilde av kvittering" className="camera-preview-image" />
                ) : null}
                <form onSubmit={handleScan} className="stacked-form">
                  <button type="submit" disabled={scanning}>
                    {scanning ? 'Leser kvittering…' : 'Skann kvittering'}
                  </button>
                  <button type="button" className="modal-switch" onClick={handleRetake}>
                    Ta bildet på nytt
                  </button>
                </form>
              </div>
            ) : null}

            {mode === 'choose' ? (
              <button type="button" className="modal-switch" onClick={onSwitchToManual}>
                Legg til manuelt i stedet
              </button>
            ) : null}
          </>
        ) : (
          <div className="receipt-result">
            <div className="receipt-summary">
              <strong>{result.merchantName || 'Ukjent butikk'}</strong>
              <span>
                {result.transactionDate ? new Date(result.transactionDate).toLocaleDateString('no-NO') : 'Ukjent dato'}
                {result.total ? ` · Totalt ${result.total} kr` : ''}
              </span>
            </div>

            {result.items.length === 0 ? (
              <p>Fant ingen varer på kvitteringen.</p>
            ) : (
              <ul>
                {result.items.map((item, index) => {
                  const isAdded = addedItems.has(index);
                  return (
                    <li key={index} className="list-row">
                      <div>
                        <strong>{item.name || 'Ukjent vare'}</strong>
                        <span>{item.price} kr</span>
                      </div>
                      {isAdded ? (
                        <div className="pending-actions">
                          <button type="button" disabled className="pending-button">Lagt til</button>
                          <button
                            type="button"
                            className="cancel-request-button"
                            disabled={undoingIndex === index}
                            onClick={() => handleUndoItem(index)}
                          >
                            {undoingIndex === index ? 'Angrer…' : 'Angre'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={addingIndex === index}
                          onClick={() => handleAddItem(item, index)}
                        >
                          {addingIndex === index ? 'Legger til…' : 'Legg til'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="receipt-result-actions">
              <button type="button" onClick={handleClose}>Ferdig</button>
              <button
                type="button"
                className="modal-switch"
                onClick={() => { setResult(null); setFile(null); setMode('choose'); }}
              >
                Skann en annen kvittering
              </button>
            </div>
          </div>
        )}
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
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [wishlistAddError, setWishlistAddError] = useState('');
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

  const loadWishes = async () => {
    try {
      setWishlistLoading(true);
      const data = await apiFetch('/wishes');
      setWishlistItems(
        (data ?? [])
          .filter((wish) => wish.householdId === household.householdId)
          .map((wish) => ({
            id: wish.id,
            name: wish.title,
            url: wish.link,
            addedBy: memberDisplayName(wish.addedByUser)
          }))
      );
      setError('');
    } catch (err) {
      setError(err.message || 'Kunne ikke laste ønskelisten');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadWishes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household.householdId]);

  const addPurchasedItem = async (values) => {
    setAddError('');
    try {
      const created = await apiFetch('/items', {
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
      return created;
    } catch (err) {
      setAddError(err.message || 'Kunne ikke legge til vare');
      throw err;
    }
  };

  const removePurchasedItem = async (itemId) => {
    setAddError('');
    try {
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      await loadItems();
    } catch (err) {
      setAddError(err.message || 'Kunne ikke fjerne vare');
      throw err;
    }
  };

  const addWishlistItem = async (values) => {
    setWishlistAddError('');
    try {
      await apiFetch('/wishes', {
        method: 'POST',
        body: JSON.stringify({
          title: values.name,
          link: values.url || null,
          price: null,
          addedByUserId: currentUser.id,
          householdId: household.householdId
        })
      });
      await loadWishes();
    } catch (err) {
      setWishlistAddError(err.message || 'Kunne ikke legge til i ønskelisten');
      throw err;
    }
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
          {wishlistLoading ? <p>Laster…</p> : (
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
          )}
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
        <ReceiptUploadModal
          onClose={() => setOpenPanel(null)}
          onAddItem={addPurchasedItem}
          onRemoveItem={removePurchasedItem}
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
          error={wishlistAddError}
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
          onDelete={() => removePurchasedItem(selectedPurchasedItem.itemId)}
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
