import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AlarmRing from './pages/AlarmRing.jsx'
import { setToken } from './api/client.js'

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false)

  function handleAuthed(token) {
    setToken(token)
    setIsAuthed(true)
  }

  function handleLogout() {
    setToken(null)
    setIsAuthed(false)
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/" replace /> : <Login onAuthed={handleAuthed} />}
        />
        <Route
          path="/signup"
          element={isAuthed ? <Navigate to="/" replace /> : <Signup onAuthed={handleAuthed} />}
        />
        <Route
          path="/"
          element={isAuthed ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/ring/:alarmId"
          element={isAuthed ? <AlarmRing /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </HashRouter>
  )
}
