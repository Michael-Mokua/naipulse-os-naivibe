import { useState } from 'react';

export default function AuthField({ id, label, type = 'text', accent = '#00FF88', value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const floated = focused || value.length > 0;
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="auth-field-wrap">
      <label
        htmlFor={id}
        className={`auth-field-label ${floated ? 'up' : ''}`}
        style={{ color: floated ? (focused ? accent : '#555') : '#444' }}
      >
        {label}
      </label>
      {isPassword ? (
        <div className="auth-password-wrap">
          <input
            id={id}
            className="auth-field-input"
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ '--auth-accent': accent, '--auth-accent-glow': `${accent}33` }}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      ) : (
        <input
          id={id}
          className="auth-field-input"
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ '--auth-accent': accent, '--auth-accent-glow': `${accent}33` }}
        />
      )}
    </div>
  );
}
