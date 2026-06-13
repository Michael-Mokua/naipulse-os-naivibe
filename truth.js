import { useState } from "react";

const VERDICT_CONFIG = {
    TRUE: { label: "Verified True", color: "#0F6E56", bg: "#E1F5EE", icon: "ti-circle-check" },
    FALSE: { label: "False", color: "#993C1D", bg: "#FAECE7", icon: "ti-circle-x" },
    MISLEADING: { label: "Misleading", color: "#854F0B", bg: "#FAEEDA", icon: "ti-alert-triangle" },
    UNVERIFIED: { label: "Unverified", color: "#533AB7", bg: "#EEEDFE", icon: "ti-help-circle" },
};

export default function TruthModule() {
    const [claim, setClaim] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function checkClaim() {
        if (!claim.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 1000,
                    tools: [{ type: "web_search_20250305", name: "web_search" }],
                    system: `You are TRUTH, a fact-checking AI for NAIROBI INTEL. Your job is to fact-check claims, headlines, and WhatsApp forwards — especially those circulating in Kenya and Africa.

After searching the web for evidence, respond ONLY with a valid JSON object. No preamble, no markdown, no backticks. The JSON must have exactly these fields:
{
  "verdict": "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED",
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence plain English verdict explanation>",
  "sources": [
    { "title": "<source name>", "url": "<url>", "stance": "supports" | "contradicts" | "neutral" }
  ],
  "context": "<1 sentence of important Kenyan or African context if relevant, else empty string>"
}`,
                    messages: [{ role: "user", content: `Fact-check this claim: "${claim}"` }],
                }),
            });

            const data = await res.json();
            const textBlock = data.content?.find(b => b.type === "text");
            if (!textBlock) throw new Error("No response from AI");

            const clean = textBlock.text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            setResult(parsed);
        } catch (e) {
            setError("Could not process this claim. Try again.");
        } finally {
            setLoading(false);
        }
    }

    const vc = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED : null;

    return (
        <div style={{ fontFamily: "var(--font-sans)", maxWidth: 640, margin: "0 auto", padding: "1.5rem 0" }}>
            <h2 className="sr-only">TRUTH — AI Fact Checker</h2>

            <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>Nairobi Intel</span>
                <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 6px" }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "#185FA5", textTransform: "uppercase" }}>Truth</span>
            </div>

            <p style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>Fact checker</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 1.5rem" }}>Paste any headline, claim, or WhatsApp forward. We'll check it against live sources.</p>

            <textarea
                value={claim}
                onChange={e => setClaim(e.target.value)}
                placeholder="e.g. 'Kenya has banned all plastic bags' or paste a WhatsApp forward..."
                rows={4}
                style={{ width: "100%", resize: "vertical", fontSize: 14, padding: "10px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
                onKeyDown={e => { if (e.key === "Enter" && e.metaKey) checkClaim(); }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                    onClick={checkClaim}
                    disabled={loading || !claim.trim()}
                    style={{ padding: "8px 20px", fontSize: 14, fontWeight: 500, cursor: loading || !claim.trim() ? "not-allowed" : "pointer", opacity: loading || !claim.trim() ? 0.5 : 1 }}
                >
                    {loading ? "Checking..." : "Check claim"}
                    {!loading && <i className="ti ti-arrow-right" style={{ marginLeft: 6 }} aria-hidden="true" />}
                </button>
            </div>

            {loading && (
                <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="ti ti-world-search" style={{ fontSize: 18, color: "var(--color-text-secondary)" }} aria-hidden="true" />
                        <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Searching live sources and analysing claim...</span>
                    </div>
                </div>
            )}

            {error && (
                <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "var(--color-background-danger)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-danger)" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-danger)" }}>{error}</p>
                </div>
            )}

            {result && vc && (
                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ padding: "1.25rem", background: vc.bg, borderRadius: "var(--border-radius-lg)", border: `0.5px solid ${vc.color}40` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <i className={`ti ${vc.icon}`} style={{ fontSize: 22, color: vc.color }} aria-hidden="true" />
                            <span style={{ fontSize: 18, fontWeight: 500, color: vc.color }}>{vc.label}</span>
                            <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 500, color: vc.color, background: `${vc.color}18`, padding: "3px 10px", borderRadius: "var(--border-radius-md)" }}>
                                {result.confidence}% confidence
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.summary}</p>
                        {result.context && (
                            <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                                <i className="ti ti-map-pin" style={{ fontSize: 14, marginRight: 4 }} aria-hidden="true" />
                                {result.context}
                            </p>
                        )}
                    </div>

                    {result.sources?.length > 0 && (
                        <div style={{ padding: "1rem 1.25rem", background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
                            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sources checked</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {result.sources.map((s, i) => {
                                    const stanceColor = s.stance === "supports" ? "#0F6E56" : s.stance === "contradicts" ? "#993C1D" : "#5F5E5A";
                                    const stanceBg = s.stance === "supports" ? "#E1F5EE" : s.stance === "contradicts" ? "#FAECE7" : "#F1EFE8";
                                    return (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: "var(--border-radius-md)", background: stanceBg, color: stanceColor, minWidth: 72, textAlign: "center" }}>
                                                {s.stance}
                                            </span>
                                            <a href={s.url} style={{ fontSize: 13, color: "var(--color-text-info)", textDecoration: "none", flex: 1 }}>
                                                {s.title}
                                                <i className="ti ti-external-link" style={{ fontSize: 12, marginLeft: 4 }} aria-hidden="true" />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { setResult(null); setClaim(""); }}
                        style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 14px" }}
                    >
                        <i className="ti ti-refresh" style={{ marginRight: 6 }} aria-hidden="true" />
                        Check another claim
                    </button>
                </div>
            )}
        </div>
    );
}