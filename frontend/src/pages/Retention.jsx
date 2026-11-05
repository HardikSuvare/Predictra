
import { useEffect, useState } from 'react'

import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
  Target,
  Users
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000'

const formatNumber = value =>
  new Intl.NumberFormat('en-IN').format(value || 0)

const ACTION_KEYS = [
  'month_to_month',
  'high_risk_outreach',
  'highest_probability_review'
]

export default function Retention() {
  const [dashboardData, setDashboardData] = useState(null)
  const [done, setDone] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState([])
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const loadRetentionData = async () => {
    try {
      setLoading(true)
      setError('')

      const [dashboardResponse, actionsResponse] = await Promise.all([
        fetch(`${API_URL}/api/predictions/dashboard-summary`),
        fetch(`${API_URL}/api/retention/actions`)
      ])

      const dashboard = await dashboardResponse.json().catch(() => ({}))
      const actions = await actionsResponse.json().catch(() => ({}))

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboard.detail || `Dashboard API Error: ${dashboardResponse.status}`
        )
      }

      if (!actionsResponse.ok) {
        throw new Error(
          actions.detail || `Retention API Error: ${actionsResponse.status}`
        )
      }

      setDashboardData(dashboard)

      const completedActions = (actions.actions || [])
        .filter(action => action.is_completed)
        .map(action => action.action_key)

      setDone(completedActions)

    } catch (err) {
      console.error('Retention loading error:', err)
      setError(err.message || 'Unable to load retention data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRetentionData()
  }, [])

  const toggleDone = async index => {
    const actionKey = ACTION_KEYS[index]

    if (!actionKey || saving.includes(index)) return

    const wasCompleted = done.includes(actionKey)
    const newStatus = !wasCompleted

    try {
      setActionError('')
      setSaving(previous => [...previous, index])

      const response = await fetch(
        `${API_URL}/api/retention/actions/${actionKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_completed: newStatus
          })
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to update retention action.'
        )
      }

      setDone(previous =>
        newStatus
          ? [...previous, actionKey]
          : previous.filter(item => item !== actionKey)
      )

    } catch (err) {
      console.error('Retention action update error:', err)
      setActionError(err.message || 'Unable to save action.')
    } finally {
      setSaving(previous =>
        previous.filter(item => item !== index)
      )
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="panel">
          <h3>Loading Retention Hub...</h3>
          <p>Analyzing live customer risk and contract patterns.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="panel">
          <h3>Unable to load retention data</h3>
          <p>{error}</p>

          <button
            className="button button-primary"
            onClick={loadRetentionData}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || {}
  const contractData = dashboardData?.contractData || []
  const customersToWatch = dashboardData?.customersToWatch || []

  const monthToMonth = contractData.find(
    item => item.type?.toLowerCase().includes('month')
  )

  const recommendations = [
    {
      tag: 'High priority',
      count: `${formatNumber(monthToMonth?.total || 0)} customers`,
      title: 'Focus on month-to-month customers',
      detail: monthToMonth
        ? `This segment has an actual churn rate of ${Number(monthToMonth.rate).toFixed(1)}%. Prioritize engagement, understand customer concerns and offer suitable longer-term plans.`
        : 'Review month-to-month customers and identify opportunities to improve engagement.'
    },
    {
      tag: 'High risk',
      count: `${formatNumber(metrics.highRisk || 0)} customers`,
      title: 'Prioritize high-risk customer outreach',
      detail: 'These customers have a predicted churn probability of at least 65%. Consider personalized outreach, support follow-ups and relevant retention offers.'
    },
    {
      tag: 'Personalized outreach',
      count: `${customersToWatch.length} customers`,
      title: 'Review customers with the highest churn probability',
      detail: customersToWatch.length
        ? `Start with the ${customersToWatch.length} customers currently listed among the highest churn probabilities. Review their accounts and prioritize individual follow-ups.`
        : 'Review the highest-risk customer predictions when available.'
    }
  ]

  const highRiskCustomers = Number(metrics.highRisk || 0)

  return (
    <div className="page-content">

      {/* PAGE HEADER */}
      <div className="page-intro-row">
        <div>
          <div className="eyebrow">
            CUSTOMER SUCCESS
          </div>

          <h2>Retention hub</h2>

          <p>
            Turn churn insights into practical customer-retention actions.
          </p>
        </div>

        <div className="model-chip">
          <Sparkles size={14} />
          ACTION CENTER
        </div>
      </div>

      {/* RETENTION HERO */}
      <div className="retention-hero">
        <div className="retention-hero-icon">
          <HeartHandshake size={25} />
        </div>

        <div>
          <span>RETENTION OPPORTUNITY</span>

          <h3>
            Keep valuable relationships moving forward.
          </h3>

          <p>
            Prioritize outreach based on customer risk,
            actual churn patterns and subscription contracts.
          </p>
        </div>

        <div className="retention-hero-metric">
          <strong>
            {formatNumber(highRiskCustomers)}
          </strong>

          <span>high-risk customers</span>
        </div>
      </div>

      {/* RETENTION SUMMARY */}
      <div className="retention-summary">

        <div className="summary-tile">
          <Target size={18} />
          <span>Recommended actions</span>
          <strong>{recommendations.length}</strong>
        </div>

        <div className="summary-tile">
          <Users size={18} />
          <span>High-risk customers</span>
          <strong>{formatNumber(highRiskCustomers)}</strong>
        </div>

        <div className="summary-tile">
          <CheckCircle2 size={18} />
          <span>Actions reviewed</span>
          <strong>{done.length}</strong>
        </div>

      </div>

      {/* RECOMMENDED PLAYBOOKS */}
      <div className="section-heading">
        <div>
          <h3>Recommended playbooks</h3>

          <p>
            Retention priorities based on live customer and ML prediction data.
          </p>
        </div>
      </div>

      <div className="recommendation-list">

        {recommendations.map((r, i) => {
          const isDone = done.includes(ACTION_KEYS[i])

          return (
            <article
              className="panel recommendation-card"
              key={r.title}
            >
              <div className="recommendation-number">
                0{i + 1}
              </div>

              <div className="recommendation-body">

                <div className="recommendation-meta">
                  <span className="badge badge-medium">
                    {r.tag}
                  </span>

                  <span>{r.count}</span>
                </div>

                <h3>{r.title}</h3>

                <p>{r.detail}</p>

                <button
                  className="text-button"
                  onClick={() => toggleDone(i)}
                  disabled={saving.includes(i)}
                >
                  {saving.includes(i)
                    ? 'Saving...'
                    : isDone
                      ? 'Marked complete'
                      : 'Mark as reviewed'}

                  <ArrowRight size={15} />
                </button>

              </div>

              <div className="recommendation-check">
                {isDone
                  ? <CheckCircle2 size={21} />
                  : <Sparkles size={21} />}
              </div>

            </article>
          )
        })}

      </div>

      {actionError && (
        <div className="empty-state">
          {actionError}
        </div>
      )}

      {/* DATA NOTICE */}
      <div className="demo-notice">
        Retention playbooks are generated using actual customer
        churn statistics and trained ML model predictions.
        Suggested actions are recommendations for review,
        not automatically executed customer communications.
      </div>

    </div>
  )
}
