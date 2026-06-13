import { useState } from 'react';
import { VERDICT_CONFIG, generateSimulatedTruth } from '../data.js';

export default function TruthModule() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function checkClaim() {
    if (!claim.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const evaluation = generateSimulatedTruth(claim);
      setResult(evaluation);
      setLoading(false);
    }, 700);
  }

  const verdict = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED : null;

  return (
    <div className="module-wrapper truth-module">
      <div className="truth-hero">
        <div className="truth-tag">NAI PULSE OS · TRUTH ENGINE</div>
        <h1 className="truth-title">FACT CHECKER</h1>
        <p className="truth-subtitle">Paste any headline, claim, or WhatsApp forward. The simulator returns a Nairobi-aware verdict.</p>
      </div>

      <div className="truth-input-wrap">
        <textarea
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          placeholder="e.g. 'Kenya has banned all plastic bags'"
          rows={4}
          className="truth-textarea"
        />
        <div className="truth-action-row">
          <span className="truth-keytip">Ctrl+Enter to check</span>
          <button className="truth-btn" onClick={checkClaim} disabled={loading || !claim.trim()}>
            {loading ? 'CHECKING...' : 'CHECK CLAIM'}
          </button>
        </div>
      </div>

      {loading && <div className="truth-loading">Checking live sources...</div>}

      {result && verdict && (
        <div className="truth-result">
          <div className="verdict-card" style={{ background: verdict.bg, borderColor: verdict.color }}>
            <div className="verdict-header">
              <i className={`ti ${verdict.icon}`} style={{ color: verdict.color }} />
              <div>
                <div className="verdict-label">{verdict.label}</div>
                <div className="verdict-confidence">{result.confidence}% confidence</div>
              </div>
            </div>
            <p className="verdict-summary">{result.summary}</p>
            {result.context && <p className="verdict-context">{result.context}</p>}
          </div>

          <div className="sources-panel">
            <div className="sources-title">Sources checked</div>
            {result.sources.map((source, index) => (
              <div key={index} className="source-row">
                <span className={`source-stance source-${source.stance}`}>{source.stance}</span>
                <a href={source.url} target="_blank" rel="noreferrer" className="source-link">
                  {source.title}
                </a>
              </div>
            ))}
          </div>

          <button className="truth-reset" onClick={() => { setClaim(''); setResult(null); }}>
            Reset claim
          </button>
        </div>
      )}
    </div>
  );
}
