import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  UserRoundX,
  ShieldCheck,
  IndianRupee,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Clock3,
  Activity as ActivityIcon,
  RefreshCw
} from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

import StatCard from '../components/StatCard'

const API_URL = 'https://predictra-p8pz.onrender.com'

const formatCurrency = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0)

const formatNumber = value =>
  new Intl.NumberFormat('en-IN').format(value || 0)


// API request helper
async function fetchJson(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`)

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.detail || `API request failed: ${response.status}`
    )
  }

  return data
}


export default function Dashboard({ navigate }) {

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // Load dashboard summary from optimized backend endpoint
  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await fetchJson(
        '/api/predictions/dashboard-summary'
      )

      setDashboardData(data)

    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err.message || 'Unable to load dashboard data.')

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadDashboard()
  }, [])


  // Dashboard metrics received from backend
  const metrics = dashboardData?.metrics || {
    total: 0,
    actualChurn: 0,
    predictedChurn: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    retentionRate: 0,
    revenueAtRisk: 0
  }


  // Chart data received from backend
  const contractData = dashboardData?.contractData || []
  const riskData = dashboardData?.riskData || []
  const revenueData = dashboardData?.revenueData || []
  const tenureData = dashboardData?.tenureData || []
  const customersToWatch = dashboardData?.customersToWatch || []


  // Keep compatibility with the original JSX
  const predictions = {
    length: metrics.total
  }


  // Contract with highest historical churn rate
  const highestRiskContract = useMemo(() => {

    if (!contractData.length) return null

    return [...contractData].sort(
      (a, b) => Number(b.rate) - Number(a.rate)
    )[0]

  }, [contractData])



  // Loading screen.
  if (loading) {
    return (
      <div className="page-content">
        <div className="result-empty">
          <RefreshCw size={30} />

          <h3>Loading live dashboard...</h3>

          <p>
            Fetching customer records and ML predictions.
          </p>
        </div>
      </div>
    )
  }


  // Error screen.
  if (error) {
    return (
      <div className="page-content">
        <div className="panel">

          <h3>Unable to load dashboard</h3>

          <p>{error}</p>

          <button
            className="button button-primary"
            onClick={loadDashboard}
          >
            <RefreshCw size={16} />
            Retry
          </button>

        </div>
      </div>
    )
  }


  return (
    <div className="page-content">

      {/* WELCOME SECTION */}
      <div className="welcome-row">

        <div>

          <div className="live-label">
            <span className="status-dot" />
            LIVE CUSTOMER INTELLIGENCE
          </div>

          <h2>
            Good morning, Hardik <span className="wave">✦</span>
          </h2>

          <p>
            Here's what's happening with your customer base.
          </p>

        </div>

        <button
          className="button button-secondary"
          onClick={() => navigate('analytics')}
        >
          View reports <ArrowUpRight size={16} />
        </button>

      </div>


      {/* KPI CARDS */}
      <div className="stats-grid">

        <StatCard
          label="Total customers"
          value={formatNumber(metrics.total)}
          icon={Users}
          note="Database records"
        />

        <StatCard
          label="Predicted churn"
          value={formatNumber(metrics.predictedChurn)}
          icon={UserRoundX}
          note="Predicted by ML model"
        />

        <StatCard
          label="Retention rate"
          value={`${metrics.retentionRate.toFixed(1)}%`}
          icon={ShieldCheck}
          note="Based on actual churn labels"
        />

        <StatCard
          label="Revenue at risk"
          value={formatCurrency(metrics.revenueAtRisk)}
          icon={IndianRupee}
          note="Estimated monthly exposure"
        />

      </div>


      <div className="dashboard-grid">

        {/* CHURN BY CONTRACT */}
        <section className="panel trend-panel">

          <div className="panel-heading">
            <div>
              <h3>Churn by contract</h3>
              <p>Historical churn rate from customer records</p>
            </div>
          </div>

          <div className="chart-wrap">

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={contractData}
                margin={{
                  top: 12,
                  right: 8,
                  left: -22,
                  bottom: 0
                }}
              >

                <defs>
                  <linearGradient
                    id="churnFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b75ff"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="100%"
                      stopColor="#8b75ff"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#222b40"
                  strokeDasharray="3 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="type"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#8290aa',
                    fontSize: 11
                  }}
                />

                <YAxis
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#8290aa',
                    fontSize: 11
                  }}
                />

                <Tooltip
                  formatter={value => [
                    `${value}%`,
                    'Actual churn rate'
                  ]}
                  contentStyle={{
                    background: '#151d30',
                    border: '1px solid #2b3650',
                    borderRadius: 12,
                    color: '#fff'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Actual churn"
                  stroke="#9a83ff"
                  strokeWidth={2.5}
                  fill="url(#churnFill)"
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>
        </section>


        {/* RISK DISTRIBUTION */}
        <section className="panel risk-panel">

          <div className="panel-heading">
            <div>
              <h3>Customer risk segments</h3>
              <p>Distribution by predicted risk</p>
            </div>
          </div>

          <div className="risk-chart">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={67}
                  outerRadius={91}
                  paddingAngle={4}
                  stroke="none"
                >
                  {riskData.map(segment => (
                    <Cell
                      key={segment.name}
                      fill={segment.color}
                    />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <strong>
                {formatNumber(predictions.length)}
              </strong>

              <span>Predictions</span>
            </div>

          </div>

          <div className="risk-legend">

            {riskData.map(segment => (
              <div key={segment.name}>

                <span>
                  <i style={{ background: segment.color }} />
                  {segment.name}
                </span>

                <strong>
                  {formatNumber(segment.value)}
                </strong>

              </div>
            ))}

          </div>

        </section>

      </div>


      {/* ANALYTICS SECTION */}
      <div className="visual-section-heading">

        <div>
          <span className="section-eyebrow">
            CUSTOMER INTELLIGENCE
          </span>

          <h3>Explore your business signals</h3>

          <p>
            Insights calculated from your customer records
            and ML predictions.
          </p>
        </div>

        <span className="sample-data-tag">
          LIVE DATA
        </span>

      </div>


      <div className="visual-grid">

        {/* REVENUE AT RISK */}
        <section className="panel visual-panel revenue-panel">

          <div className="panel-heading">
            <div>
              <h3>Revenue at risk</h3>

              <p>
                Monthly charges from predicted churn customers
              </p>
            </div>
          </div>

          <div className="visual-kpi-row">

            <strong>
              {formatCurrency(metrics.revenueAtRisk)}
            </strong>

            <span className="negative-trend">
              {formatNumber(metrics.highRisk)} high risk
            </span>

          </div>

          <div className="visual-chart">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{
                  top: 8,
                  right: 5,
                  left: -15,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  stroke="#222b40"
                  strokeDasharray="3 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="contract"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#8290aa',
                    fontSize: 10
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#8290aa',
                    fontSize: 10
                  }}
                />

                <Tooltip
                  formatter={value => [
                    formatCurrency(value),
                    'Monthly revenue at risk'
                  ]}
                  contentStyle={{
                    background: '#151d30',
                    border: '1px solid #2b3650',
                    borderRadius: 10
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="#9b83ff"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="visual-footnote">
            <span>
              <i className="legend-dot violet" />
              Monthly revenue exposed
            </span>
          </div>

        </section>


        {/* CONTRACT CHURN */}
        <section className="panel visual-panel contract-panel">

          <div className="panel-heading">
            <div>
              <h3>Churn by contract</h3>
              <p>Actual churn percentage by contract type</p>
            </div>
          </div>

          <div className="contract-chart">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contractData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 15,
                  left: 0,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  stroke="#222b40"
                  strokeDasharray="3 5"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#8290aa',
                    fontSize: 10
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="type"
                  width={90}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#aeb9ce',
                    fontSize: 10
                  }}
                />

                <Tooltip
                  formatter={value => [
                    `${value}%`,
                    'Actual churn rate'
                  ]}
                />

                <Bar
                  dataKey="rate"
                  fill="#f0788d"
                  radius={[0, 6, 6, 0]}
                  barSize={17}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="contract-callout">

            <strong>
              {highestRiskContract?.type || 'No data'}
            </strong>

            <span>
              {highestRiskContract
                ? ` has the highest actual churn rate (${highestRiskContract.rate}%).`
                : 'Contract data is unavailable.'}
            </span>

          </div>

        </section>


        {/* TENURE MIX */}
        <section className="panel visual-panel activity-panel">

          <div className="panel-heading">

            <div>
              <h3>Customer tenure mix</h3>
              <p>How long customers have stayed</p>
            </div>

            <span className="visual-icon cyan">
              <ActivityIcon />
            </span>

          </div>

          <div className="activity-content">

            <div className="activity-donut">

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={tenureData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={67}
                    paddingAngle={3}
                    stroke="none"
                  >

                    {tenureData.map((item, index) => (
                      <Cell
                        key={item.label}
                        fill={[
                          '#f0788d',
                          '#f2b95f',
                          '#39d6d0',
                          '#35c99a'
                        ][index]}
                      />
                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>

              <div className="activity-center">
                <strong>
                  {formatNumber(metrics.total)}
                </strong>

                <span>Customers</span>
              </div>

            </div>

            <div className="activity-legend">

              {tenureData.map((item, index) => (
                <div key={item.label}>

                  <span>
                    <i
                      style={{
                        background: [
                          '#f0788d',
                          '#f2b95f',
                          '#39d6d0',
                          '#35c99a'
                        ][index]
                      }}
                    />

                    {item.label}
                  </span>

                  <strong>
                    {formatNumber(item.value)}
                  </strong>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* PREDICTION SUMMARY */}
        <section className="panel visual-panel retention-panel">

          <div className="panel-heading">
            <div>
              <h3>Prediction summary</h3>
              <p>Customer risk classification</p>
            </div>
          </div>

          <div className="visual-kpi-row">

            <strong>
              {formatNumber(metrics.predictedChurn)}
            </strong>

            <span className="negative-trend">
              Predicted to churn
            </span>

          </div>

          <div className="retention-progress">

            <div>
              <span>High risk</span>

              <strong>
                {metrics.total
                  ? (metrics.highRisk / metrics.total * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>

            <div className="progress-track">
              <i
                style={{
                  width: `${
                    metrics.total
                      ? metrics.highRisk / metrics.total * 100
                      : 0
                  }%`
                }}
              />
            </div>

          </div>

          <div className="retention-progress">

            <div>
              <span>Medium risk</span>

              <strong>
                {metrics.total
                  ? (metrics.mediumRisk / metrics.total * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>

            <div className="progress-track">
              <i
                style={{
                  width: `${
                    metrics.total
                      ? metrics.mediumRisk / metrics.total * 100
                      : 0
                  }%`
                }}
              />
            </div>

          </div>

          <div className="retention-progress">

            <div>
              <span>Low risk</span>

              <strong>
                {metrics.total
                  ? (metrics.lowRisk / metrics.total * 100).toFixed(1)
                  : 0
                }%
              </strong>
            </div>

            <div className="progress-track">
              <i
                style={{
                  width: `${
                    metrics.total
                      ? metrics.lowRisk / metrics.total * 100
                      : 0
                  }%`
                }}
              />
            </div>

          </div>

        </section>

      </div>


      {/* CUSTOMERS TO WATCH */}
      <div className="bottom-grid">

        <section className="panel customers-panel">

          <div className="panel-heading">

            <div>
              <h3>Customers to watch</h3>
              <p>Highest churn probability customers</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate('customers')}
            >
              View all <ArrowRight size={15} />
            </button>

          </div>

          <div className="table-scroll">

            <table>

              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>CONTRACT</th>
                  <th>RISK SCORE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {customersToWatch.map(item => (
                  <tr key={item.customer_id}>

                    <td>
                      <div className="customer-cell">

                        <div className="avatar avatar-blue">
                          {item.customer_id.slice(0, 2)}
                        </div>

                        <div>
                          <strong>{item.customer_id}</strong>
                          <small>Customer account</small>
                        </div>

                      </div>
                    </td>

                    <td>
                      {item.customer?.contract || 'Unknown'}
                    </td>

                    <td>
                      <div className="score-cell">

                        <div className="mini-track">
                          <i
                            style={{
                              width: `${item.churn_probability}%`
                            }}
                          />
                        </div>

                        <strong>
                          {Number(
                            item.churn_probability
                          ).toFixed(1)}%
                        </strong>

                      </div>
                    </td>

                    <td>
                      <span className="badge badge-danger">
                        {item.risk_level}
                      </span>
                    </td>

                  </tr>
                ))}

                {customersToWatch.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      No predicted churn customers found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* DATA INSIGHT */}
        <section className="panel insight-panel">

          <div className="insight-heading">

            <div className="insight-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <span>DATA INSIGHT</span>
              <h3>Retention opportunities</h3>
            </div>

          </div>

          <p className="insight-copy">

            {highestRiskContract
              ? `${highestRiskContract.type} customers have the highest historical churn rate in your dataset. Prioritize customer engagement in this group.`
              : 'Load customer records to identify retention opportunities.'}

          </p>

          <div className="insight-metric">

            <strong>
              {formatNumber(metrics.highRisk)}
            </strong>

            <span>
              customers classified as high risk
            </span>

          </div>

          <button
            className="button button-primary button-full"
            onClick={() => navigate('retention')}
          >
            Explore retention hub <ArrowRight size={16} />
          </button>

          <div className="insight-foot">
            <Clock3 size={13} />
            Calculated from current customer data
          </div>

        </section>

      </div>


      {/* DATA EXPLANATION */}
      <div className="form-disclaimer">

        <Sparkles size={14} />

        Dashboard metrics are calculated from your MySQL
        customer records and trained ML model predictions.
        Revenue at risk is estimated using monthly charges
        for customers with predicted churn probability
        of at least 40%.

      </div>

    </div>
  )
}
