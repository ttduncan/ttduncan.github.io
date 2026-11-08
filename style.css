:root {
  --bg: #0b1020;
  --bg-soft: #111827;
  --panel: rgba(17, 24, 39, 0.9);
  --panel-strong: #121a2c;
  --card: rgba(15, 23, 42, 0.92);
  --line: rgba(148, 163, 184, 0.18);
  --text: #edf6ff;
  --muted: #aab7cc;
  --primary: #7dd3fc;
  --green: #34d399;
  --amber: #fbbf24;
  --danger: #f87171;
  --shadow: rgba(2, 6, 23, 0.7);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top, rgba(34, 197, 94, 0.08), transparent 30%),
    radial-gradient(circle at bottom, rgba(125, 211, 252, 0.10), transparent 25%),
    var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  padding: 18px 14px 40px;
}

.app-shell {
  max-width: 460px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 14px;
}

.brand {
  font-size: 0.92rem;
  letter-spacing: 0.2em;
  font-weight: 800;
  color: var(--text);
}

.nav {
  display: flex;
  gap: 8px;
}

.nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
  font-size: 0.8rem;
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.2s ease;
}

.nav a.active {
  background: rgba(148, 163, 184, 0.08);
  border-color: var(--line);
  color: var(--text);
}

.page {
  display: grid;
  gap: 16px;
}

.hero {
  background: linear-gradient(180deg, rgba(18, 26, 43, 0.96), rgba(10, 16, 28, 0.94));
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: 18px 18px 16px;
  box-shadow: 0 20px 40px var(--shadow);
}

.hero.compact {
  padding-bottom: 12px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary);
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 8vw, 3.4rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.subtitle {
  margin: 12px 0 0;
  color: var(--muted);
  line-height: 1.55;
  font-size: 0.96rem;
}

.status {
  min-height: 20px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.workout-card,
.library-card {
  background: rgba(18, 26, 43, 0.92);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 18px 16px 14px;
  box-shadow: 0 18px 32px var(--shadow);
}

.card-list {
  display: grid;
  gap: 14px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.12);
  color: var(--primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.duration {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 700;
}

h2 {
  margin: 8px 0 10px;
  font-size: 1.7rem;
  letter-spacing: -0.05em;
  line-height: 1.05;
}

.summary {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 0.94rem;
  line-height: 1.55;
}

.equipment {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 0.77rem;
}

.section-label {
  margin: 18px 0 10px;
  color: var(--primary);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
}

ol {
  margin: 0;
  padding-left: 18px;
  color: var(--text);
}

li {
  margin-bottom: 10px;
  line-height: 1.55;
}

@media (min-width: 760px) {
  .app-shell {
    max-width: 760px;
  }

  .card-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}