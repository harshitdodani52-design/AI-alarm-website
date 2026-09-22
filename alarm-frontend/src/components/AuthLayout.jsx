export default function AuthLayout({ eyebrow, title, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <span style={styles.eyebrow}>{eyebrow}</span>
        <h1 style={styles.title}>{title}</h1>
        {children}
      </div>
      <p style={styles.footer}>Tasks are written, not skipped.</p>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '36px 32px',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 600,
    margin: '8px 0 28px',
  },
  footer: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-dim)',
  },
}
