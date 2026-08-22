import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as propertiesApi from '../../api/properties';
import * as locationsApi from '../../api/locations';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import TagInput from '../../components/TagInput';
import { PROPERTY_TYPES, FURNISHING_OPTIONS, TENANT_TYPES } from '../../utils/constants';

// ── Essential-first creation ────────────────────────────────────────────
// Purpose → Category → Property Type → Basic Details, per spec. Everything
// else is added afterwards on the edit screen below.
function CreatePropertyForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    purpose: 'rent',
    category: 'residential',
    propertyType: 'flat',
    locationArea: '',
    price: '',
    bhk: '',
    furnishing: '',
    tenantType: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    locationsApi.listActiveLocations().then(({ data }) => setLocations(data.locations));
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.locationArea || !form.price) {
      setError('Location and price are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await propertiesApi.createProperty({
        ...form,
        price: Number(form.price),
        bhk: form.bhk ? Number(form.bhk) : undefined,
        furnishing: form.furnishing || undefined,
        tenantType: form.tenantType || undefined,
      });
      navigate(`/properties/manage/${data.property._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium mb-2">Purpose</p>
        <div className="flex gap-2">
          <Chip selected={form.purpose === 'rent'} onClick={() => set('purpose')('rent')}>Rent</Chip>
          <Chip selected={form.purpose === 'sale'} onClick={() => set('purpose')('sale')}>Sale</Chip>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Category</p>
        <div className="flex gap-2">
          <Chip selected={form.category === 'residential'} onClick={() => set('category')('residential')}>Residential</Chip>
          <Chip selected={form.category === 'commercial'} onClick={() => set('category')('commercial')}>Commercial</Chip>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <Chip key={t.value} selected={form.propertyType === t.value} onClick={() => set('propertyType')(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Location</label>
          <select
            value={form.locationArea}
            onChange={(e) => set('locationArea')(e.target.value)}
            className="w-full border border-harbor-200 rounded-sm px-3 py-2"
          >
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Price (₹/month)</label>
          <input
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => set('price')(e.target.value)}
            className="w-full border border-harbor-200 rounded-sm px-3 py-2 font-mono"
            placeholder="e.g. 45000"
          />
        </div>
      </div>

      {form.propertyType === 'flat' && (
        <div>
          <p className="text-sm font-medium mb-2">BHK</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <Chip key={n} selected={String(form.bhk) === String(n)} onClick={() => set('bhk')(n)}>{n} BHK</Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2">Furnishing</p>
        <div className="flex flex-wrap gap-2">
          {FURNISHING_OPTIONS.map((f) => (
            <Chip key={f.value} selected={form.furnishing === f.value} onClick={() => set('furnishing')(f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Tenant preference <span className="text-harbor font-normal">(optional)</span></p>
        <div className="flex flex-wrap gap-2">
          {TENANT_TYPES.map((t) => (
            <Chip key={t.value} selected={form.tenantType === t.value} onClick={() => set('tenantType')(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-laterite-700">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Saving…' : 'Save as draft — add photos next'}
      </Button>
    </form>
  );
}

// ── Edit-later: photos, amenities, availability, internal data ─────────
function EditPropertyForm({ id }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const canSeeCommission = user.role === 'admin' || user.role === 'broker';

  useEffect(() => {
    propertiesApi.getInternalProperty(id).then(({ data }) => setProperty(data.property)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <p className="text-harbor">Loading…</p>;
  if (!property) return <p className="text-harbor">Property not found.</p>;

  const setPublic = (key, value) => setProperty((p) => ({ ...p, public: { ...p.public, [key]: value } }));
  const setInternal = (key, value) => setProperty((p) => ({ ...p, internal: { ...p.internal, [key]: value } }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await propertiesApi.updateProperty(id, { public: property.public, internal: property.internal });
      setMessage('Saved.');
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    await save();
    await propertiesApi.publishProperty(id);
    navigate('/properties/manage');
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="text-xs px-2 py-1 rounded-full border border-harbor-200 capitalize">{property.status}</span>
        {property.status === 'draft' && (
          <Button size="sm" onClick={publish}>Publish</Button>
        )}
        {property.status === 'published' && (
          <Button size="sm" variant="outline" onClick={async () => { await propertiesApi.hideProperty(id); navigate('/properties/manage'); }}>
            Hide from public site
          </Button>
        )}
      </div>

      <section>
        <h2 className="font-display text-lg mb-3">Public details</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <input
              value={property.public.title || ''}
              onChange={(e) => setPublic('title', e.target.value)}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2"
              placeholder={`e.g. ${property.public.bhk || ''} BHK in ${property.public.locationArea}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea
              value={property.public.description || ''}
              onChange={(e) => setPublic('description', e.target.value)}
              rows={4}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Building / society name</label>
            <input
              value={property.public.buildingName || ''}
              onChange={(e) => setPublic('buildingName', e.target.value)}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2"
            />
          </div>
          <TagInput
            label="Photos (URLs)"
            values={property.public.photos || []}
            onChange={(v) => setPublic('photos', v)}
            placeholder="Paste a photo URL and press Enter"
          />
          <TagInput
            label="Amenities"
            values={property.public.amenities || []}
            onChange={(v) => setPublic('amenities', v)}
            placeholder="e.g. Lift, Power backup"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={property.public.availability?.isAvailable ?? true}
              onChange={(e) => setPublic('availability', { ...property.public.availability, isAvailable: e.target.checked })}
            />
            Currently available
          </label>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg mb-3">Internal details <span className="text-harbor text-sm font-normal">(never shown publicly)</span></h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Exact flat/unit number</label>
            <input
              value={property.internal.exactUnitNumber || ''}
              onChange={(e) => setInternal('exactUnitNumber', e.target.value)}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Owner contact name</label>
              <input
                value={property.internal.ownerContactName || ''}
                onChange={(e) => setInternal('ownerContactName', e.target.value)}
                className="w-full border border-harbor-200 rounded-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Owner contact mobile</label>
              <input
                value={property.internal.ownerContactMobile || ''}
                onChange={(e) => setInternal('ownerContactMobile', e.target.value)}
                className="w-full border border-harbor-200 rounded-sm px-3 py-2 font-mono"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Caretaker contact name</label>
              <input
                value={property.internal.caretakerContactName || ''}
                onChange={(e) => setInternal('caretakerContactName', e.target.value)}
                className="w-full border border-harbor-200 rounded-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Caretaker contact mobile</label>
              <input
                value={property.internal.caretakerContactMobile || ''}
                onChange={(e) => setInternal('caretakerContactMobile', e.target.value)}
                className="w-full border border-harbor-200 rounded-sm px-3 py-2 font-mono"
              />
            </div>
          </div>
          {canSeeCommission && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Commission type</label>
                <select
                  value={property.internal.commissionType || ''}
                  onChange={(e) => setInternal('commissionType', e.target.value || undefined)}
                  className="w-full border border-harbor-200 rounded-sm px-3 py-2"
                >
                  <option value="">Not set</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat amount</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Commission value</label>
                <input
                  type="number"
                  value={property.internal.commissionValue ?? ''}
                  onChange={(e) => setInternal('commissionValue', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-harbor-200 rounded-sm px-3 py-2 font-mono"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">Keys information</label>
            <input
              value={property.internal.keysInfo || ''}
              onChange={(e) => setInternal('keysInfo', e.target.value)}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2"
              placeholder="e.g. With watchman, ask for flat 12A key"
            />
          </div>
          <TagInput
            label="Documents (URLs)"
            values={property.internal.documents || []}
            onChange={(v) => setInternal('documents', v)}
            placeholder="Paste a document URL and press Enter"
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        {message && <span className="text-sm text-harbor">{message}</span>}
      </div>
    </div>
  );
}

export default function PropertyFormPage() {
  const { id } = useParams();
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-2xl mb-6">{id ? 'Edit property' : 'Add a property'}</h1>
      {id ? <EditPropertyForm id={id} /> : <CreatePropertyForm />}
    </div>
  );
}
