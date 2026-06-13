import { useState, useEffect } from "react";

const MATATU_COLORS = {
    yellow: "#EF9F27",
    yellowDark: "#633806",
    yellowBg: "#FAEEDA",
    red: "#E24B4A",
    redDark: "#501313",
    redBg: "#FCEBEB",
    green: "#639922",
    greenDark: "#173404",
    greenBg: "#EAF3DE",
    purple: "#7F77DD",
    purpleDark: "#26215C",
    purpleBg: "#EEEDFE",
    teal: "#1D9E75",
    tealDark: "#04342C",
    tealBg: "#E1F5EE",
    coral: "#D85A30",
    coralDark: "#4A1B0C",
    coralBg: "#FAECE7",
};

const ROUTES = [
    { num: "46", name: "CBD — Westlands", status: "moving", color: MATATU_COLORS.yellow, textColor: MATATU_COLORS.yellowDark },
    { num: "11", name: "CBD — Eastleigh", status: "jam", color: MATATU_COLORS.red, textColor: MATATU_COLORS.redDark },
    { num: "23", name: "CBD — Kawangware", status: "moving", color: MATATU_COLORS.teal, textColor: MATATU_COLORS.tealDark },
    { num: "58", name: "CBD — Githurai", status: "jam", color: MATATU_COLORS.coral, textColor: MATATU_COLORS.coralDark },
    { num: "34", name: "CBD — Langata", status: "moving", color: MATATU_COLORS.purple, textColor: MATATU_COLORS.purpleDark },
    { num: "19", name: "CBD — Kasarani", status: "slow", color: MATATU_COLORS.green, textColor: MATATU_COLORS.greenDark },
];

const NSE_STOCKS = [
    { sym: "SCOM", name: "Safaricom", price: "13.85", change: "+0.20", up: true },
    { sym: "EQTY", name: "Equity Bank", price: "42.50", change: "+1.25", up: true },
    { sym: "KCB", name: "KCB Group", price: "27.30", change: "-0.45", up: false },
    { sym: "KPLC", name: "Kenya Power", price: "2.10", change: "+0.05", up: true },
    { sym: "COOP", name: "Co-op Bank", price: "12.90", change: "-0.10", up: false },
    { sym: "ABSA", name: "Absa Kenya", price: "14.20", change: "+0.30", up: true },
];

const WEATHER_DATA = {
    temp: 22,
    feels: 21,
    condition: "Partly cloudy",
    humidity: 68,
    wind: 14,
    aqi: "Good",
    aqiColor: MATATU_COLORS.green,
    aqiTextColor: MATATU_COLORS.greenDark,
    aqiBg: MATATU_COLORS.greenBg,
};

const FOOTBALL = [
    { home: "Gor Mahia", away: "AFC Leopards", score: "2 - 1", live: true, comp: "KPL" },
    { home: "PSG", away: "Man City", score: "3 - 2", live: false, comp: "UCL" },
    { home: "Arsenal", away: "Chelsea", score: "1 - 1", live: false, comp: "EPL" },
];

const HEADLINES = [
    { title: "Nairobi expressway reduces CBD congestion by 40% — KENHA report", tag: "Transport" },
    { title: "NSE 20-share index gains 1.2% on strong banking sector earnings", tag: "Business" },
    { title: "Rains expected to resume in Nairobi this weekend — KMD", tag: "Weather" },
    { title: "Huawei opens new ICT talent centre at University of Nairobi", tag: "Tech" },
];

function RouteBoard() {
    return (
        <div style={{ background: "#1a1a1a", borderRadius: "var(--border-radius-lg)", padding: "1rem", border: `2px solid ${MATATU_COLORS.yellow}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ background: MATATU_COLORS.yellow, borderRadius: 4, padding: "2px 10px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: MATATU_COLORS.yellowDark, letterSpacing: "0.1em" }}>MATATU ROUTES</span>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: MATATU_COLORS.green, marginLeft: "auto" }} />
                <span style={{ fontSize: 11, color: "#aaa" }}>Live</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                {ROUTES.map(r => (
                    <div key={r.num} style={{ background: r.color, borderRadius: "var(--border-radius-md)", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 500, color: r.textColor, minWidth: 32 }}>{r.num}</span>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: r.textColor }}>{r.name.split("—")[1]?.trim()}</p>
                            <p style={{ margin: 0, fontSize: 10, color: r.textColor, opacity: 0.8 }}>
                                {r.status === "jam" ? "Heavy traffic" : r.status === "slow" ? "Slow moving" : "Clear"}
                            </p>
                        </div>
                        <i className={`ti ${r.status === "jam" ? "ti-alert-triangle" : r.status === "slow" ? "ti-clock" : "ti-circle-check"}`}
                            style={{ marginLeft: "auto", fontSize: 14, color: r.textColor }} aria-hidden="true" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function WeatherCard() {
    return (
        <div style={{ background: "#0F3D5C", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", border: `2px solid #378ADD` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#85B7EB", letterSpacing: "0.08em" }}>NAIROBI</p>
                    <p style={{ margin: "4px 0 0", fontSize: 36, fontWeight: 500, color: "#fff" }}>{WEATHER_DATA.temp}°C</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#B5D4F4" }}>{WEATHER_DATA.condition}</p>
                </div>
                <i className="ti ti-cloud-sun" style={{ fontSize: 48, color: MATATU_COLORS.yellow }} aria-hidden="true" />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, borderTop: "0.5px solid #185FA5", paddingTop: 12 }}>
                {[
                    { icon: "ti-droplet", val: `${WEATHER_DATA.humidity}%`, label: "Humidity" },
                    { icon: "ti-wind", val: `${WEATHER_DATA.wind} km/h`, label: "Wind" },
                    { icon: "ti-leaf", val: WEATHER_DATA.aqi, label: "Air quality" },
                ].map(d => (
                    <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
                        <i className={`ti ${d.icon}`} style={{ fontSize: 16, color: "#85B7EB" }} aria-hidden="true" />
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: "#fff" }}>{d.val}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#85B7EB" }}>{d.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NSEStrip() {
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setOffset(o => (o - 1) % (NSE_STOCKS.length * 120)), 30);
        return () => clearInterval(id);
    }, []);
    const items = [...NSE_STOCKS, ...NSE_STOCKS];
    return (
        <div style={{ background: "#1a1a1a", borderRadius: "var(--border-radius-md)", padding: "8px 12px", overflow: "hidden", border: `0.5px solid ${MATATU_COLORS.yellow}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: MATATU_COLORS.yellow, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>NSE</span>
                <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ display: "flex", gap: 24, transition: "transform 0.03s linear", transform: `translateX(${offset}px)`, whiteSpace: "nowrap" }}>
                        {items.map((s, i) => (
                            <span key={i} style={{ fontSize: 12, color: s.up ? "#5DCAA5" : "#F09595", display: "inline-flex", gap: 6, alignItems: "center" }}>
                                <span style={{ color: "#ccc", fontWeight: 500 }}>{s.sym}</span>
                                {s.price}
                                <span>{s.up ? "▲" : "▼"} {s.change}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FootballCard() {
    return (
        <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: `2px solid ${MATATU_COLORS.green}`, overflow: "hidden" }}>
            <div style={{ background: MATATU_COLORS.green, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-ball-football" style={{ fontSize: 14, color: MATATU_COLORS.greenDark }} aria-hidden="true" />
                <span style={{ fontSize: 11, fontWeight: 500, color: MATATU_COLORS.greenDark, letterSpacing: "0.08em" }}>SCORES</span>
            </div>
            <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {FOOTBALL.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: f.live ? MATATU_COLORS.redBg : "var(--color-background-secondary)", color: f.live ? MATATU_COLORS.red : "var(--color-text-tertiary)", fontWeight: 500, minWidth: 32, textAlign: "center" }}>
                            {f.live ? "Live" : f.comp}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--color-text-primary)", flex: 1 }}>{f.home}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", background: "var(--color-background-secondary)", padding: "2px 8px", borderRadius: 4 }}>{f.score}</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-primary)", flex: 1, textAlign: "right" }}>{f.away}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Headlines() {
    const tagColors = {
        Transport: { bg: MATATU_COLORS.yellowBg, text: MATATU_COLORS.yellowDark },
        Business: { bg: MATATU_COLORS.tealBg, text: MATATU_COLORS.tealDark },
        Weather: { bg: "#E6F1FB", text: "#0C447C" },
        Tech: { bg: MATATU_COLORS.purpleBg, text: MATATU_COLORS.purpleDark },
    };
    return (
        <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: `2px solid ${MATATU_COLORS.purple}`, overflow: "hidden" }}>
            <div style={{ background: MATATU_COLORS.purple, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-news" style={{ fontSize: 14, color: MATATU_COLORS.purpleDark }} aria-hidden="true" />
                <span style={{ fontSize: 11, fontWeight: 500, color: MATATU_COLORS.purpleDark, letterSpacing: "0.08em" }}>HEADLINES</span>
            </div>
            <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: 10 }}>
                {HEADLINES.map((h, i) => {
                    const tc = tagColors[h.tag] || { bg: "#eee", text: "#333" };
                    return (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: tc.bg, color: tc.text, fontWeight: 500, whiteSpace: "nowrap", marginTop: 2 }}>{h.tag}</span>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{h.title}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function PulseModule() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
    const date = now.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });

    return (
        <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0" }}>
            <h2 className="sr-only">Nairobi Intel — PULSE live city dashboard</h2>

            <div style={{ background: "#111", borderRadius: "var(--border-radius-lg)", padding: "12px 16px", marginBottom: 12, border: `3px solid ${MATATU_COLORS.yellow}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: MATATU_COLORS.yellow, padding: "3px 10px", borderRadius: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: MATATU_COLORS.yellowDark, letterSpacing: "0.15em" }}>NAIROBI INTEL</span>
                    </div>
                    <span style={{ color: MATATU_COLORS.coral, fontSize: 13, fontWeight: 500 }}>PULSE</span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#fff" }}>{time}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{date}</p>
                </div>
            </div>

            <NSEStrip />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
                <WeatherCard />
                <FootballCard />
            </div>

            <div style={{ marginTop: 12 }}>
                <RouteBoard />
            </div>

            <div style={{ marginTop: 12 }}>
                <Headlines />
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", letterSpacing: "0.06em" }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                    Nairobi, Kenya · Data refreshes every 60s
                </span>
            </div>
        </div>
    );
}