 // Converts a "HH:mm" IST time picked in the UI into a full UTC ISO string
// for today's date (or tomorrow's, if that IST time has already passed today).
export function istTimeToUtcIso(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number)

  const now = new Date()
  // Build the IST wall-clock date using the offset (+05:30), then let Date
  // handle the UTC conversion for us.
  const istOffsetMinutes = 5.5 * 60

  const istNow = new Date(now.getTime() + istOffsetMinutes * 60000)
  let istTarget = new Date(Date.UTC(
    istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(),
    hours, minutes, 0
  ))

  if (istTarget <= istNow) {
    istTarget = new Date(istTarget.getTime() + 24 * 60 * 60000)
  }

  const utcTarget = new Date(istTarget.getTime() - istOffsetMinutes * 60000)
  return utcTarget.toISOString()
}

export function utcIsoToIstDisplay(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Extracts the { hours, minutes } of an alarm's scheduled time, as it would
// read on an IST clock — regardless of what date the stored UTC timestamp is on.
export function getIstHourMinute(iso) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))

  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = Number(parts.find((p) => p.type === 'minute').value)
  return { hour, minute }
}

// Returns today's 3-letter IST day code, e.g. "MON", to compare against repeatDays.
export function getTodayIstDayCode() {
  const dayName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date())
  return dayName.toUpperCase().slice(0, 3)
}

// Returns how many whole minutes have passed since IST midnight, right now.
export function getMinutesSinceIstMidnight() {
  const { hour, minute } = getIstHourMinute(new Date().toISOString())
  return hour * 60 + minute
}