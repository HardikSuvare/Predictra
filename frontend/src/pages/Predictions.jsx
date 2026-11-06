
import { useEffect, useMemo, useState } from 'react'
import {
  BrainCircuit,
  RotateCcw,
  ShieldCheck,
  Info,
  RefreshCw
} from 'lucide-react'

const API_URL = 'https://predictra-p8pz.onrender.com'

export default function Predictions() {
  const [predictions, setPredictions] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPredictions = async () => {
    try {
      setLoading(true)
      setError('')

      // Clear selection whenever predictions are refreshed
      setSelectedId('')

      const response = await fetch(
        `${API_URL}/api/predictions/all?skip=0&limit=100`
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const records = data.predictions || []

      setPredictions(records)

      // Do not automatically select the first customer
      setSelectedId('')

    } catch (err) {
      setError(err.message || 'Unable to load predictions.')
      setPredictions([])
      setSelectedId('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPredictions()
  }, [])

  const result = useMemo(
    () => predictions.find(
      p => p.customer_id === selectedId
    ),
    [predictions, selectedId]
  )

  const getRiskClass = level => {
    return (level || 'Low').toLowerCase()
  }

  return (
    <div className="page-content">

      <div className="page-intro-row">
        <div>
          <div className="eyebrow">MACHINE LEARNING WORKSPACE</div>
          <h2>Churn predictions</h2>
          <p>
            Analyze customer churn risk using your trained machine-learning model.
          </p>
        </div>

        <span className="model-chip">
          <span className="status-dot" />
          LIVE ML MODEL
        </span>
      </div>

      <div className="prediction-layout">

        <section className="panel prediction-form">

          <div className="panel-heading">
            <div>
              <h3>Select customer</h3>
              <p>Choose a customer from your database predictions.</p>
            </div>

            <div className="stat-icon">
              <BrainCircuit size={19} />
            </div>
          </div>

          <div className="form-grid">

            <label>
              Customer ID
              <span>Select a customer record</span>

              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                disabled={loading || predictions.length === 0}
              >
                <option value="">
                  -- Select Customer ID --
                </option>

                {predictions.map(customer => (
                  <option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.customer_id}
                  </option>
                ))}
              </select>
            </label>

          </div>

          <div className="form-actions">
            <button
              className="button button-primary"
              onClick={loadPredictions}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? 'Loading...' : 'Refresh predictions'}
            </button>

            <button
              className="button button-ghost"
              onClick={() => setSelectedId('')}
              disabled={loading || !selectedId}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="form-disclaimer">
            <Info size={14} />
            Predictions are generated using the saved Scikit-learn model.
          </div>

          {error && (
            <div className="empty-state">
              {error}
            </div>
          )}

          {!loading && !error && predictions.length === 0 && (
            <div className="empty-state">
              No predictions were returned by the backend.
            </div>
          )}

        </section>

        <section className="panel prediction-result">

          <div className="result-top">
            <div className="insight-icon">
              <BrainCircuit size={19} />
            </div>
            <span>MODEL ANALYSIS RESULT</span>
          </div>

          {loading ? (
            <div className="result-empty">
              <RefreshCw size={30} />
              <h3>Loading predictions...</h3>
              <p>Fetching predictions from your FastAPI backend.</p>
            </div>
          ) : result ? (
            <>
              <div className={`risk-score-ring ${getRiskClass(result.risk_level)}`}>
                <strong>
                  {Number(result.churn_probability).toFixed(2)}%
                </strong>
                <span>Churn probability</span>
              </div>

              <span className={`badge badge-${getRiskClass(result.risk_level)}`}>
                {result.risk_level} churn risk
              </span>

              <h3>
                {result.predicted_churn === 'Yes'
                  ? 'Churn predicted'
                  : 'Customer likely to stay'}
              </h3>

              <p>
                {result.predicted_churn === 'Yes'
                  ? 'The trained model predicts that this customer may leave the service. Consider proactive retention actions.'
                  : 'The trained model predicts that this customer is likely to remain with the service.'}
              </p>

              <div className="detail-grid">
                <div>
                  <span>Customer ID</span>
                  <strong>{result.customer_id}</strong>
                </div>

                <div>
                  <span>Predicted churn</span>
                  <strong>{result.predicted_churn}</strong>
                </div>

                <div>
                  <span>Actual churn</span>
                  <strong>{result.actual_churn ?? 'Not available'}</strong>
                </div>

                <div>
                  <span>Model threshold</span>
                  <strong>
                    {result.threshold != null
                      ? `${(Number(result.threshold) * 100).toFixed(0)}%`
                      : 'Not available'}
                  </strong>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="button button-secondary"
                  onClick={loadPredictions}
                  disabled={loading}
                >
                  <RefreshCw size={15} />
                  Refresh result
                </button>
              </div>
            </>
          ) : (
            <div className="result-empty">
              <div className="brain-orbit">
                <BrainCircuit size={38} />
              </div>
              <h3>
                {selectedId
                  ? 'Prediction unavailable'
                  : 'Select a customer to begin'}
              </h3>
              <p>
                {selectedId
                  ? 'No prediction is available for this customer.'
                  : 'Choose a Customer ID from the dropdown to view its individual churn prediction.'}
              </p>
            </div>
          )}

        </section>

      </div>

      <div className="form-disclaimer">
        <ShieldCheck size={15} />
        Results are generated by the trained customer churn prediction pipeline.
        Actual churn represents the historical dataset label.
      </div>

    </div>
  )
}
