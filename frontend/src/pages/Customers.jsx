
import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  SlidersHorizontal,
  Plus,
  ArrowUpDown
} from 'lucide-react'

import { getCustomers, getAllPredictions } from '../services/api'

const PAGE_SIZE = 20

export default function Customers() {
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('All risk levels')
  const [selected, setSelected] = useState(null)

  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCustomers() {
      setLoading(true)
      setError('')

      try {
        const skip = page * PAGE_SIZE

        const [customerData, predictionData] = await Promise.all([
          getCustomers(skip, PAGE_SIZE, query),
          getAllPredictions(skip, PAGE_SIZE)
        ])

        if (cancelled) return

        const predictionMap = new Map(
          predictionData.predictions.map(item => [
            item.customer_id,
            item
          ])
        )

        const mergedCustomers = customerData.customers.map(customer => {
          const prediction = predictionMap.get(customer.customer_id)

          return {
            id: customer.customer_id,
            name: customer.customer_id,
            email: 'Not available in dataset',
            plan: customer.internet_service || 'No internet',
            tenure: customer.tenure ?? 0,
            monthly: Number(customer.monthly_charges || 0).toFixed(2),
            contract: customer.contract || 'Unknown',
            payment: customer.payment_method || 'Unknown',
            risk: prediction?.risk_level || 'Unknown',
            churn: prediction?.churn_probability ?? 0,
            predicted: prediction?.predicted_churn || 'Unknown',
            actual: customer.actual_churn || 'Unknown',
            status:
              prediction?.predicted_churn === 'Yes'
                ? 'At risk'
                : 'Active'
          }
        })

        setCustomers(mergedCustomers)
        setTotal(customerData.total)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load customers')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCustomers()

    return () => {
      cancelled = true
    }
  }, [page, query])

  const filtered = customers.filter(customer =>
    risk === 'All risk levels' || customer.risk === risk
  )

  const exportCsv = () => {
    const rows = [
      [
        'Customer ID',
        'Internet Service',
        'Contract',
        'Tenure',
        'Monthly Charges',
        'Risk',
        'Churn Probability',
        'Predicted Churn',
        'Actual Churn'
      ],
      ...filtered.map(customer => [
        customer.id,
        customer.plan,
        customer.contract,
        customer.tenure,
        customer.monthly,
        customer.risk,
        customer.churn,
        customer.predicted,
        customer.actual
      ])
    ]

    const csv = rows
      .map(row =>
        row.map(value =>
          `"${String(value ?? '').replaceAll('"', '""')}"`
        ).join(',')
      )
      .join('\n')

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    )

    const a = document.createElement('a')
    a.href = url
    a.download = 'predictra-customers.csv'
    a.click()

    URL.revokeObjectURL(url)
  }

  const averageTenure = customers.length
    ? (
        customers.reduce((sum, customer) => sum + customer.tenure, 0) /
        customers.length
      ).toFixed(1)
    : '0'

  const highRisk = customers.filter(
    customer => customer.risk === 'High'
  ).length

  return (
    <div className="page-content">

      <div className="page-intro-row">
        <div>
          <div className="eyebrow">CUSTOMER DIRECTORY</div>
          <h2>Customers</h2>
          <p>
            Understand your customer base and identify accounts
            that need attention.
          </p>
        </div>

        <button
          className="button button-primary"
          onClick={() => alert('Customer creation will be added next.')}
        >
          <Plus size={16} /> Add customer
        </button>
      </div>

      <div className="mini-stats">
        <div>
          <span>Total records</span>
          <strong>{total.toLocaleString()}</strong>
        </div>

        <div>
          <span>Showing</span>
          <strong>{filtered.length}</strong>
        </div>

        <div>
          <span>High risk on page</span>
          <strong className="text-red">{highRisk}</strong>
        </div>

        <div>
          <span>Average tenure on page</span>
          <strong>{averageTenure} mo</strong>
        </div>
      </div>

      <section className="panel directory-panel">

        <div className="directory-toolbar">

          <div className="search-input">
            <Search size={17} />

            <input
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setPage(0)
              }}
              placeholder="Search customer ID..."
            />
          </div>

          <div className="toolbar-actions">

            <div className="select-wrap">
              <SlidersHorizontal size={15} />

              <select
                value={risk}
                onChange={event => setRisk(event.target.value)}
              >
                <option>All risk levels</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <button
              className="button button-secondary"
              onClick={exportCsv}
              disabled={loading || filtered.length === 0}
            >
              <Download size={15} /> Export CSV
            </button>

          </div>
        </div>

        {error && (
          <div className="empty-state">
            {error}
            <p>Check that your FastAPI backend is running.</p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            Loading real customers and ML predictions...
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="table-scroll">

              <table>
                <thead>
                  <tr>
                    <th>CUSTOMER <ArrowUpDown size={12} /></th>
                    <th>PLAN</th>
                    <th>TENURE</th>
                    <th>MONTHLY</th>
                    <th>RISK LEVEL</th>
                    <th>CHURN SCORE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(customer => (
                    <tr
                      key={customer.id}
                      onClick={() => setSelected(customer)}
                      className="clickable-row"
                    >
                      <td>
                        <div className="customer-cell">
                          <div className="avatar avatar-blue">
                            {customer.id.slice(0, 2)}
                          </div>

                          <div>
                            <strong>{customer.id}</strong>
                            <small>Customer account</small>
                          </div>
                        </div>
                      </td>

                      <td>{customer.plan}</td>

                      <td>{customer.tenure} mo</td>

                      <td>${customer.monthly}</td>

                      <td>
                        <span
                          className={`badge badge-${customer.risk.toLowerCase()}`}
                        >
                          {customer.risk}
                        </span>
                      </td>

                      <td>
                        <div className="score-cell">
                          <div className="mini-track">
                            <i
                              className={
                                customer.risk === 'High'
                                  ? 'risk-high'
                                  : customer.risk === 'Medium'
                                    ? 'risk-medium'
                                    : 'risk-low'
                              }
                              style={{
                                width: `${customer.churn}%`
                              }}
                            />
                          </div>

                          <strong>{customer.churn}%</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-text ${
                            customer.status === 'At risk'
                              ? 'text-red'
                              : 'text-green'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="empty-state">
                  No matching customers found.
                </div>
              )}

            </div>

            <div className="table-footer">
              Showing {filtered.length} records
              <span>
                Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              </span>
            </div>

            <div className="pagination-controls">
              <button
                className="button button-secondary"
                disabled={page === 0}
                onClick={() => setPage(current => current - 1)}
              >
                Previous
              </button>

              <button
                className="button button-secondary"
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage(current => current + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}

      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="detail-modal"
            onClick={event => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <div className="avatar avatar-purple modal-avatar">
              {selected.id.slice(0, 2)}
            </div>

            <h3>{selected.id}</h3>
            <p>Customer account details</p>

            <div className="detail-grid">

              <div>
                <span>Customer ID</span>
                <strong>{selected.id}</strong>
              </div>

              <div>
                <span>Internet service</span>
                <strong>{selected.plan}</strong>
              </div>

              <div>
                <span>Tenure</span>
                <strong>{selected.tenure} months</strong>
              </div>

              <div>
                <span>Monthly charge</span>
                <strong>${selected.monthly}</strong>
              </div>

              <div>
                <span>Contract</span>
                <strong>{selected.contract}</strong>
              </div>

              <div>
                <span>Payment</span>
                <strong>{selected.payment}</strong>
              </div>

              <div>
                <span>Actual churn</span>
                <strong>{selected.actual}</strong>
              </div>

              <div>
                <span>Predicted churn</span>
                <strong>{selected.predicted}</strong>
              </div>

            </div>

            <div className="detail-risk">
              <span>Churn probability</span>
              <strong>{selected.churn}%</strong>
            </div>

            <p className="modal-note">
              Prediction generated using the trained Predictra
              machine learning model.
            </p>

          </div>
        </div>
      )}

    </div>
  )
}
