// components/studio/shared/SmartCommandBar.js
// Clean 8K QA: primary natural-language control, compact and icon-first.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';

export const SMART_COMMAND_HE = Object.freeze({
  label: 'מה תרצה ליצור או לדייק?',
  send: 'שלח הנחיה',
});

function SendIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SmartCommandBar({ onSubmitCommand }) {
  const [text, setText] = React.useState('');
  const [response, setResponse] = React.useState(null);

  const submit = () => {
    const value = text.trim();
    if (!value || typeof onSubmitCommand !== 'function') return;
    const result = onSubmitCommand(value);
    setResponse(result && typeof result.responseHe === 'string' ? result.responseHe : null);
    setText('');
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.inputRow}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={SMART_COMMAND_HE.label}
          style={styles.input}
          aria-label={SMART_COMMAND_HE.label}
        />
        <button
          type="button"
          onClick={submit}
          style={{ ...styles.sendBtn, ...(!text.trim() ? styles.sendBtnDisabled : null) }}
          disabled={!text.trim()}
          title={SMART_COMMAND_HE.send}
          aria-label={SMART_COMMAND_HE.send}
        >
          <SendIcon />
        </button>
      </div>
      {response ? <p style={styles.response} role="status">{response}</p> : null}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  inputRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  input: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '40px',
    padding: '9px 14px',
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '13.5px',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: reset.radius.md,
    border: 'none',
    background: reset.color.primaryBg,
    color: reset.color.primaryText,
    cursor: 'pointer',
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.45, cursor: 'default' },
  response: {
    margin: 0,
    paddingInline: '2px',
    fontFamily: reset.font.body,
    fontSize: '12px',
    color: reset.color.textMuted,
    lineHeight: 1.45,
  },
};
