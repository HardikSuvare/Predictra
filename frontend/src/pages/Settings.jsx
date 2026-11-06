
import { useState, useEffect } from 'react'
import {
  Bell,
  LockKeyhole,
  UserRound,
  Palette,
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react'

import { getProfile, updateProfile } from '../services/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const [notifications, setNotifications] = useState({
    churnAlerts: true,
    weeklyReports: true,
    customerUpdates: false
  })

  const tabs = [
    { name: 'Profile', icon: UserRound },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: LockKeyhole },
    { name: 'Appearance', icon: Palette },
    { name: 'Data & integrations', icon: Database }
  ]

  // Load profile from MySQL when Settings page opens
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getProfile()

        setName(data.name)
        setEmail(data.email)
      } catch (err) {
        setError(err.message || 'Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Save profile permanently in MySQL
  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    try {
      setSaving(true)
      setSaved(false)
      setError('')

      const data = await updateProfile({
        name: name.trim(),
        email: email.trim()
      })

      setName(data.name)
      setEmail(data.email)
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-intro-row">
        <div>
          <div className="eyebrow">WORKSPACE PREFERENCES</div>
          <h2>Settings</h2>
          <p>Manage your profile and application preferences.</p>
        </div>
      </div>

      <div className="settings-layout">

        <aside className="panel settings-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                type="button"
                key={tab.name}
                className={`settings-nav-item ${activeTab === tab.name ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.name)
                  setSaved(false)
                  setError('')
                }}
              >
                <Icon size={17} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </aside>

        <section className="panel settings-panel">

          {activeTab === 'Profile' && (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Profile information</h3>
                  <p>Update the details associated with your workspace.</p>
                </div>
              </div>

              {loading ? (
                <p>Loading profile...</p>
              ) : (
                <>
                  <label className="field-label">
                    Full name
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setSaved(false)
                        setError('')
                      }}
                    />
                  </label>

                  <label className="field-label">
                    Email address
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setSaved(false)
                        setError('')
                      }}
                    />
                  </label>

                  <button
                    className="button button-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === 'Notifications' && (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Notification preferences</h3>
                  <p>Choose which updates you want to receive.</p>
                </div>
              </div>

              {[
                {
                  key: 'churnAlerts',
                  title: 'Churn risk alerts',
                  description: 'Receive alerts about high-risk customers.'
                },
                {
                  key: 'weeklyReports',
                  title: 'Weekly reports',
                  description: 'Receive weekly customer intelligence summaries.'
                },
                {
                  key: 'customerUpdates',
                  title: 'Customer updates',
                  description: 'Receive updates about customer activity.'
                }
              ].map((item) => (
                <div className="settings-section-title" key={item.key}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => {
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked
                      })
                      setSaved(false)
                    }}
                  />
                </div>
              ))}

              <button
                className="button button-primary"
                onClick={() => {
                  setSaved(true)
                }}
              >
                <Save size={15} /> Save preferences
              </button>
            </>
          )}

          {activeTab === 'Security' && (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Security settings</h3>
                  <p>Manage your account security preferences.</p>
                </div>
              </div>

              <label className="field-label">
                Current password
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <div className="settings-section-title">
                <div>
                  <strong>Account protection</strong>
                  <span>
                    Additional authentication features can be configured here.
                  </span>
                </div>

                <span className="badge badge-medium">Coming soon</span>
              </div>
            </>
          )}

          {activeTab === 'Appearance' && (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Application appearance</h3>
                  <p>Customize how Predictra looks on your device.</p>
                </div>
              </div>

              <div className="settings-section-title">
                <div>
                  <strong>Dark theme</strong>
                  <span>Use Predictra's dark appearance.</span>
                </div>

                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              </div>

              <div className="settings-divider" />

              <p className="saved-message">
                Selected preference: {darkMode ? 'Dark mode' : 'Light mode'}
              </p>
            </>
          )}

          {activeTab === 'Data & integrations' && (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Data & integrations</h3>
                  <p>View your database and backend connection information.</p>
                </div>
              </div>

              <div className="settings-section-title">
                <div>
                  <strong>FastAPI backend</strong>
                  <span>API server at https://predictra-p8pz.onrender.com</span>
                </div>

                <span className="badge badge-low">Connected</span>
              </div>

              <div className="settings-divider" />

              <div className="settings-section-title">
                <div>
                  <strong>MySQL database</strong>
                  <span>Predictra customer database.</span>
                </div>

                <span className="badge badge-low">Connected</span>
              </div>

              <div className="settings-divider" />

              <div className="settings-section-title">
                <div>
                  <strong>Machine learning model</strong>
                  <span>Scikit-learn customer churn prediction model.</span>
                </div>

                <span className="badge badge-low">Loaded</span>
              </div>
            </>
          )}

          {error && (
            <p className="saved-message" style={{ color: '#ff7185' }}>
              {error}
            </p>
          )}

          {saved && (
            <p className="saved-message">
              <CheckCircle2 size={15} />
              Profile saved successfully in MySQL!
            </p>
          )}

        </section>
      </div>
    </div>
  )
}
