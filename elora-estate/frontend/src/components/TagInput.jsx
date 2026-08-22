import { useState } from 'react';
import Chip from './Chip';

export default function TagInput({ label, values = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      {label && <label className="text-sm font-medium block mb-1">{label}</label>}
      <div className="flex gap-2 mb-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 border border-harbor-200 rounded-sm px-3 py-1.5 text-sm"
        />
        <button type="button" onClick={add} className="text-sm px-3 border border-harbor-200 rounded-sm hover:border-basalt">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Chip key={v} size="sm" selected onClick={() => onChange(values.filter((x) => x !== v))}>
            {v} ×
          </Chip>
        ))}
      </div>
    </div>
  );
}
