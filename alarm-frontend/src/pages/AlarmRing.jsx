import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const MIN_WORDS = 30
const MAX_WORDS = 50

export default function AlarmRing() {
  const { alarmId } = useParams()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [status, setStatus] = useState('ringing') // ringing | checking | stopped
  const [feedback, setFeedback] = useState('')
  const [attempts, setAttempts] = useState(0)
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const inRange = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS

  useEffect(() => {
    if (status === 'ringing') startBeep()
    return stopBeep
  }, [status])

  function startBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.value = 0.05
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      audioCtxRef.current = ctx
      oscRef.current = osc
    } catch {
      // Audio may be blocked until user interaction — that's fine, the visual still rings.
    }
  }

  function stopBeep() {
    oscRef.current?.stop()
    audioCtxRef.current?.close()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('checking')
    setFeedback('')
    try {
      const result = await api.validateTask({ text, alarmId })
      if (result.valid) {
        await api.saveTask({ text, alarmId })
        stopBeep()
        setStatus('stopped')
      } else {
        setAttempts((a) => a + 1)
        setFeedback(result.reason)
        setStatus('ringing')
      }
    } catch (err) {
      setFeedback(err.message)
      setStatus('ringing')
    }
  }

  if (status === 'stopped') {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.pulse, animation: 'none', borderColor: 'var(--success)' }} />
        <span style={styles.eyebrow}>Alarm stopped</span>
        <h1 style={styles.title}>Task logged. Go get it done.</h1>
        <button className="focus-ring" style={styles.primaryBtn} onClick={() => navigate('/')}>
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
      <div style={styles.pulse} />
      <span style={styles.eyebrow}>{attempts > 0 ? `Attempt ${attempts + 1}` : 'Ringing'}</span>
      <h1 style={styles.title}>Write today's task to stop the alarm</h1>
      <p style={styles.subtitle}>{MIN_WORDS}–{MAX_WORDS} words. Real and specific — not filler.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          className="focus-ring"
          style={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Today I will…"
          autoFocus
          rows={6}
        />
        <div style={styles.counterRow}>
          <span style={{
            ...styles.counter,
            color: inRange ? 'var(--success)' : 'var(--text-dim)',
          }}>
            {wordCount} / {MIN_WORDS}-{MAX_WORDS} words
          </span>
          <button
            className="focus-ring"
            style={{ ...styles.primaryBtn, opacity: status === 'checking' ? 0.6 : 1 }}
            disabled={!inRange || status === 'checking'}
          >
            {status === 'checking' ? 'Checking…' : 'Submit & stop alarm'}
          </button>
        </div>
      </form>

      {feedback && <p style={styles.feedback}>{feedback}</p>}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '24px', textAlign: 'center', position: 'relative',
  },
  pulse: {
    position: 'absolute', top: '10%', width: '180px', height: '180px', borderRadius: '50%',
    border: '3px solid var(--accent)', animation: 'ringPulse 1.4s ease-in-out infinite',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--accent)', marginTop: '140px',
  },
  title: { fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 600, margin: '10px 0 4px', maxWidth: '480px' },
  subtitle: { color: 'var(--text-dim)', fontSize: '14px', marginBottom: '28px' },
  form: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' },
  textarea: {
    background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '12px',
    padding: '16px', color: 'var(--text)', fontSize: '16px', resize: 'vertical', lineHeight: 1.5,
  },
  counterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontFamily: 'var(--font-mono)', fontSize: '13px' },
  primaryBtn: {
    background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px',
    padding: '12px 20px', fontWeight: 600, fontSize: '14px',
  },
  feedback: { color: 'var(--danger)', fontSize: '14px', marginTop: '16px', maxWidth: '420px' },
}
