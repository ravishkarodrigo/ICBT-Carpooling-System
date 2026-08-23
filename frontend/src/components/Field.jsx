// Reusable labelled input with inline error support.
export function TextField({ label, error, as = 'input', options, ...props }) {
  const cls = `${as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input'}${error ? ' error' : ''}`;
  return (
    <div className="field">
      {label && <label htmlFor={props.id || props.name}>{label}</label>}
      {as === 'textarea' ? (
        <textarea className={cls} rows={3} {...props} />
      ) : as === 'select' ? (
        <select className={cls} {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input className={cls} {...props} />
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
