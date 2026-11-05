
import { useEffect, useState } from 'react'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import {
  Download,
  TrendingDown,
  Users,
  IndianRupee
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000'

const formatNumber = value =>
  new Intl.NumberFormat('en-IN').format(value || 0)

const formatCurrency = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0)

export default function Analytics() {

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch actual analytics data from backend
  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/predictions/dashboard-summary`
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || `API Error: ${response.status}`
        )
      }

      setDashboardData(data)

    } catch (err) {
      console.error('Analytics loading error:', err)
      setError(err.message || 'Unable to load analytics.')

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="page-content">
        <div className="result-empty">
          <h3>Loading live analytics...</h3>
          <p>Fetching customer intelligence from your database.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="page-content">
        <div className="panel">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>

          <button
            className="button button-primary"
            onClick={loadAnalytics}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || {}

  const contractData = dashboardData?.contractData || []
  const tenureData = dashboardData?.tenureData || []

  // Actual customer metrics
  const totalCustomers = Number(metrics.total || 0)
  const actualChurn = Number(metrics.actualChurn || 0)

  const activeCustomers = totalCustomers - actualChurn

  const averageChurnRate = totalCustomers
    ? (actualChurn / totalCustomers) * 100
    : 0

  const revenueAtRisk = Number(metrics.revenueAtRisk || 0)

  return (
    <div className="page-content">

      {/* PAGE HEADER */}
      <div className="page-intro-row">

        <div>
          <div className="eyebrow">
            PERFORMANCE & INSIGHTS
          </div>

          <h2>Analytics</h2>

          <p>
            Explore churn patterns, customer segments and retention performance.
          </p>
        </div>

        <button
          className="button button-secondary"
          onClick={() => window.print()}
        >
          <Download size={15} />
          Export report
        </button>

      </div>


      {/* ANALYTICS STAT CARDS */}
      <div className="stats-grid analytics-stats">

        <div className="stat-card">

          <div className="stat-top">
            <span>Actual churn rate</span>

            <div className="stat-icon">
              <TrendingDown size={18} />
            </div>
          </div>

          <div className="stat-value">
            {averageChurnRate.toFixed(1)}%
          </div>

          <div className="stat-bottom">
            <span className="stat-note">
              Based on actual churn labels
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-top">
            <span>Active customers</span>

            <div className="stat-icon">
              <Users size={18} />
            </div>
          </div>

          <div className="stat-value">
            {formatNumber(activeCustomers)}
          </div>

          <div className="stat-bottom">
            <span className="stat-note">
              Customers retained
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-top">
            <span>Revenue at risk</span>

            <div className="stat-icon">
              <IndianRupee size={18} />
            </div>
          </div>

          <div className="stat-value">
            {formatCurrency(revenueAtRisk)}
          </div>

          <div className="stat-bottom">
            <span className="stat-note">
              Estimated monthly exposure
            </span>
          </div>

        </div>

      </div>


      {/* ANALYTICS CHARTS */}
      <div className="analytics-grid">

        {/* CUSTOMER TENURE */}
        <section className="panel">

          <div className="panel-heading">

            <div>
              <h3>Customer tenure distribution</h3>

              <p>
                Number of customers by subscription duration
              </p>
            </div>

          </div>

          <div className="large-chart">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={tenureData}>

                <defs>
                  <linearGradient
                    id="analyticsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#9278ff"
                      stopOpacity=".3"
                    />

                    <stop
                      offset="100%"
                      stopColor="#9278ff"
                      stopOpacity="0"
                    />

                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#222b40"
                  vertical={false}
                  strokeDasharray="3 5"
                />

                <XAxis
                  dataKey="label"
                  tick={{ fill: '#8290aa', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: '#8290aa', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#151d30',
                    border: '1px solid #2b3650',
                    borderRadius: 10
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Customers"
                  stroke="#9a83ff"
                  strokeWidth={3}
                  fill="url(#analyticsFill)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* CHURN BY CONTRACT */}
        <section className="panel">

          <div className="panel-heading">

            <div>
              <h3>Churn by contract</h3>

              <p>
                Actual churn rate per contract type
              </p>
            </div>

          </div>

          <div className="large-chart">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={contractData}
                margin={{
                  top: 15,
                  right: 5,
                  left: -20,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  stroke="#222b40"
                  vertical={false}
                  strokeDasharray="3 5"
                />

                <XAxis
                  dataKey="type"
                  tick={{ fill: '#8290aa', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: '#8290aa', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={value => [
                    `${Number(value).toFixed(1)}%`,
                    'Actual churn rate'
                  ]}
                  contentStyle={{
                    background: '#151d30',
                    border: '1px solid #2b3650',
                    borderRadius: 10
                  }}
                />

                <Bar
                  dataKey="rate"
                  name="Churn"
                  fill="#9278ff"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>

      </div>


      {/* CONTRACT PERFORMANCE TABLE */}
      <section className="panel plan-table">

        <div className="panel-heading">

          <div>
            <h3>Subscription performance</h3>

            <p>
              Compare customer outcomes across contract types
            </p>
          </div>

        </div>

        <table>

          <thead>
            <tr>
              <th>CONTRACT</th>
              <th>CUSTOMERS</th>
              <th>CHURN RATE</th>
              <th>OBSERVATION</th>
            </tr>
          </thead>

          <tbody>

            {contractData.map(contract => {

              const churnRate = Number(contract.rate || 0)

              return (
                <tr key={contract.type}>

                  <td>
                    <strong>{contract.type}</strong>
                  </td>

                  <td>
                    {formatNumber(contract.total)}
                  </td>

                  <td>
                    {churnRate.toFixed(1)}%
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        churnRate > 25
                          ? 'badge-danger'
                          : churnRate > 15
                            ? 'badge-medium'
                            : 'badge-low'
                      }`}
                    >
                      {churnRate > 25
                        ? 'Needs attention'
                        : churnRate > 15
                          ? 'Monitor'
                          : 'Healthy'}
                    </span>
                  </td>

                </tr>
              )

            })}

            {contractData.length === 0 && (
              <tr>
                <td colSpan="4">
                  No contract data available.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </section>


      {/* DATA NOTICE */}
      <div className="demo-notice">
        Analytics are calculated from your MySQL customer records
        and trained machine learning model. Historical churn rates
        use actual customer churn labels.
      </div>

    </div>
  )
}
