import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import {
istTimeToUtcIso,
utcIsoToIstDisplay,
getIstHourMinute,
getTodayIstDayCode,
getMinutesSinceIstMidnight,
} from '../api/timezone.js'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function Dashboard({ onLogout }) {
const [alarms, setAlarms] = useState([])
const [time, setTime] = useState('07:00')
const [repeatDays, setRepeatDays] = useState([])
const [error, setError] = useState('')
const [loading, setLoading] = useState(true)
const navigate = useNavigate()
const triggeredRef = useRef(new Set()) // tracks "alarmId:dateString" already fired today

useEffect(() => {
loadAlarms()
}, [])

// Polls every 15 seconds: checks if any active alarm's scheduled IST time has
// arrived (within a 1-minute window), and if so, navigates to its ring screen.
// Only works while this tab is open — see README for background-scheduling notes.
useEffect(() => {
const interval = setInterval(() => {
const nowMinutes = getMinutesSinceIstMidnight()
const todayCode = getTodayIstDayCode()
const todayDateKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

console.log('=== ALARM POLL CHECK ===')
console.log('nowMinutes (IST):', nowMinutes, 'todayCode:', todayCode)

for (const alarm of alarms) {
if (!alarm.active) {
console.log(`alarm ${alarm.id}: skipped (inactive)`)
continue
}

const isRepeating = alarm.repeatDays && alarm.repeatDays.length > 0
if (isRepeating && !alarm.repeatDays.includes(todayCode)) {
console.log(`alarm ${alarm.id}: skipped (today ${todayCode} not in`, alarm.repeatDays, ')')
continue
}

const { hour, minute } = getIstHourMinute(alarm.alarmTimeUtc)
const alarmMinutes = hour * 60 + minute
console.log(`alarm ${alarm.id}: scheduled for ${hour}:${minute} (${alarmMinutes} min), now is ${nowMinutes} min`)

const withinWindow = nowMinutes === alarmMinutes
const triggerKey = `${alarm.id}:${todayDateKey}`

if (withinWindow && !triggeredRef.current.has(triggerKey)) {
console.log(`alarm ${alarm.id}: TRIGGERING NOW`)
triggeredRef.current.add(triggerKey)
navigate(`/ring/${alarm.id}`)
}
}
}, 15000)

return () => clearInterval(interval)
}, [alarms, navigate])

async function loadAlarms() {
try {
const data = await api.getAlarms()
setAlarms(data)
} catch (err) {
setError(err.message)
} finally {
setLoading(false)
}
}

function toggleDay(day) {
setRepeatDays((prev) =>
prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
)
}

async function handleCreate(e) {
e.preventDefault()
setError('')
try {
const alarmTimeUtc = istTimeToUtcIso(time)
const created = await api.createAlarm({ alarmTimeUtc, repeatDays, active: true })
setAlarms((prev) => [...prev, created])
} catch (err) {
setError(err.message)
}
}

async function handleDelete(id) {
await api.deleteAlarm(id)
setAlarms((prev) => prev.filter((a) => a.id !== id))
}

return (
<div style={styles.page}>
<header style={styles.header}>
<div>
<span style={styles.eyebrow}>Your alarms</span>
<h1 style={styles.title}>Set it. Write it. Stop it.</h1>
<p style={styles.liveNote}>● Watching for alarm times while this tab is open</p>
</div>
<button className="focus-ring" style={styles.logoutBtn} onClick={onLogout}>
Log out
</button>
</header>

<form onSubmit={handleCreate} style={styles.form}>
<div style={styles.formRow}>
<label style={styles.label}>
Time (IST)
<input
className="focus-ring"
style={styles.timeInput}
type="time"
value={time}
onChange={(e) => setTime(e.target.value)}
required
/>
</label>

<div style={styles.daysRow}>
{DAYS.map((day) => (
<button
type="button"
key={day}
onClick={() => toggleDay(day)}
className="focus-ring"
style={{
...styles.dayChip,
...(repeatDays.includes(day) ? styles.dayChipActive : {}),
}}
>
{day}
</button>
))}
</div>

<button className="focus-ring" style={styles.addBtn}>+ Add alarm</button>
</div>
{error && <p style={styles.error}>{error}</p>}
</form>

<div style={styles.list}>
{loading && <p style={styles.dim}>Loading your alarms…</p>}
{!loading && alarms.length === 0 && (
<p style={styles.dim}>No alarms yet. Set one above — the first task is the hardest part.</p>
)}
{alarms.map((alarm) => (
<div key={alarm.id} style={styles.alarmCard}>
<div>
<p style={styles.alarmTime}>{utcIsoToIstDisplay(alarm.alarmTimeUtc)}</p>
<p style={styles.alarmDays}>
{alarm.repeatDays?.length ? alarm.repeatDays.join(' · ') : 'One-time'}
</p>
</div>
<div style={{ display: 'flex', gap: '8px' }}>
<button
className="focus-ring"
style={styles.testBtn}
onClick={() => navigate(`/ring/${alarm.id}`)}
>
Test ring
</button>
<button
className="focus-ring"
style={styles.deleteBtn}
onClick={() => handleDelete(alarm.id)}
>
Delete
</button>
</div>
</div>
))}
</div>
</div>
)
}

const styles = {
page: { maxWidth: '640px', margin: '0 auto', padding: '48px 24px' },
header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
eyebrow: {
fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em',
textTransform: 'uppercase', color: 'var(--accent)',
},
title: { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, margin: '6px 0 0' },
liveNote: { fontSize: '12px', color: 'var(--success)', margin: '8px 0 0' },
logoutBtn: {
background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
borderRadius: '8px', padding: '8px 14px', fontSize: '13px',
},
form: {
background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '14px',
padding: '20px', marginBottom: '32px',
},
formRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '16px' },
label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-dim)' },
timeInput: {
background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
padding: '8px 10px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '16px',
},
daysRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
dayChip: {
background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dim)',
borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)',
},
dayChipActive: { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' },
addBtn: {
background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px',
padding: '10px 16px', fontWeight: 600, fontSize: '14px', marginLeft: 'auto',
},
list: { display: 'flex', flexDirection: 'column', gap: '12px' },
alarmCard: {
background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '12px',
padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
},
alarmTime: { fontFamily: 'var(--font-mono)', fontSize: '22px', margin: 0 },
alarmDays: { fontSize: '12px', color: 'var(--text-dim)', margin: '4px 0 0' },
testBtn: {
background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)',
borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
},
deleteBtn: {
background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
},
dim: { color: 'var(--text-dim)', fontSize: '14px' },
error: { color: 'var(--danger)', fontSize: '13px', marginTop: '12px' },
}