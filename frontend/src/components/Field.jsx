export function Field({ label, name, type = 'text', as, options, value, onChange, error, placeholder, required }) {
  const id = `field-${name}`;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}{required && <span className="req"> *</span>}</label>
      {as === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} className={`input ${error ? 'input-error' : ''}`}>
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          className={`input ${error ? 'input-error' : ''}`} />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
