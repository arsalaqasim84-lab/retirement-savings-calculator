import React, { useState, useEffect, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import './RetirementCalculator.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const currencyFmt = (n, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

const num = (v, fallback = 0) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

const RetirementCalculator = () => {
  const [formData, setFormData] = useState({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 10000,
    monthlySavings: 500,
    annualReturn: 7,
    inflationRate: 2.5,
    currency: 'USD',
  })

  const [results, setResults] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = useMemo(() => {
    const currentAge = num(formData.currentAge)
    const retirementAge = num(formData.retirementAge)
    if (retirementAge <= currentAge) return 'Retirement age must be greater than current age.'
    if (currentAge < 16 || retirementAge > 100) return 'Please enter realistic ages.'
    if (num(formData.annualReturn) < 0 || num(formData.inflationRate) < 0) return 'Rates cannot be negative.'
    return ''
  }, [formData])

  const calculateRetirement = () => {
    const currentAge      = num(formData.currentAge)
    const retirementAge   = num(formData.retirementAge)
    const currentSavings  = num(formData.currentSavings)
    const monthlySavings  = num(formData.monthlySavings)
    const annualReturn    = num(formData.annualReturn) / 100
    const inflationRate   = num(formData.inflationRate) / 100
    const currency        = formData.currency || 'USD'

    // years + months
    const yearsToRetirement = Math.max(0, retirementAge - currentAge)
    const months = yearsToRetirement * 12

    // Real monthly rate (returns adjusted for inflation)
    // exact: (1+r_real) = (1+r_nom)/(1+i)
    const realMonthly = ((1 + annualReturn) / (1 + inflationRate)) ** (1/12) - 1

    let balance = currentSavings
    const yearlyBreakdown = []
    const labels = []
    const points = []

    for (let y = 0; y <= yearsToRetirement; y++) {
      const start = balance
      // simulate 12 months in this year (skip inside for the last year=0 case still adds baseline)
      if (y > 0) {
        for (let m = 0; m < 12; m++) {
          balance = balance * (1 + realMonthly) + monthlySavings
        }
      }
      const contribThisYear = y === 0 ? 0 : monthlySavings * 12
      const returnsThisYear = balance - start - contribThisYear

      yearlyBreakdown.push({
        year: currentAge + y,
        startBalance: start,
        contributions: contribThisYear,
        returns: returnsThisYear,
        endBalance: balance,
      })
      labels.push(`Age ${currentAge + y}`)
      points.push(Math.round(balance))
    }

    const totalContributions = monthlySavings * 12 * yearsToRetirement
    const totalReturns = balance - currentSavings - totalContributions

    setResults({
      projectedSavings: Math.round(balance),
      totalContributions,
      totalReturns,
      yearlyBreakdown,
      yearsToRetirement,
      currency,
    })

    setChartData({
      labels,
      datasets: [
        {
          label: 'Projected Savings',
          data: points,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          tension: 0.25,
          fill: true,
        },
      ],
    })
  }

  const resetForm = () => {
    setFormData({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 10000,
      monthlySavings: 500,
      annualReturn: 7,
      inflationRate: 2.5,
      currency: 'USD',
    })
    setResults(null)
    setChartData(null)
    setError('')
  }

  const shareResults = () => {
    if (!results) return
    const text = `I'm projected to have ${currencyFmt(results.projectedSavings, results.currency)} at age ${num(formData.retirementAge)}.`
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'My Retirement Savings Projection', text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
      alert('Results copied to clipboard!')
    }
  }

  useEffect(() => {
    if (validate) {
      setError(validate)
      setResults(null)
      setChartData(null)
      return
    }
    setError('')
    calculateRetirement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, validate])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Projected Savings Growth Over Time' },
      tooltip: {
        callbacks: {
          label: (ctx) => currencyFmt(ctx.raw, results?.currency || 'USD')
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: v => currencyFmt(v, results?.currency || 'USD') }
      }
    }
  }

  return (
    <div className="retirement-calculator">
      <div className="calculator-section">
        <h2>Input Your Information</h2>

        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="currentAge">Current Age</label>
            <input id="currentAge" name="currentAge" type="number" min="16" max="100"
              value={formData.currentAge} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="retirementAge">Retirement Age Goal</label>
            <input id="retirementAge" name="retirementAge" type="number" min="30" max="100"
              value={formData.retirementAge} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="currentSavings">Current Savings</label>
            <input id="currentSavings" name="currentSavings" type="number" min="0" step="100"
              value={formData.currentSavings} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="monthlySavings">Monthly Savings</label>
            <input id="monthlySavings" name="monthlySavings" type="number" min="0" step="10"
              value={formData.monthlySavings} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="annualReturn">Expected Annual Return (%)</label>
            <input id="annualReturn" name="annualReturn" type="number" min="0" max="20" step="0.1"
              value={formData.annualReturn} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="inflationRate">Inflation Rate (%)</label>
            <input id="inflationRate" name="inflationRate" type="number" min="0" max="15" step="0.1"
              value={formData.inflationRate} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="currency">Currency</label>
            <select id="currency" name="currency" value={formData.currency} onChange={handleInputChange}>
              <option>USD</option>
              <option>CAD</option>
              <option>AED</option>
              <option>PKR</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button onClick={resetForm} className="btn btn-secondary">Reset</button>
          <button onClick={shareResults} className="btn btn-primary" disabled={!results}>Share Results</button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      {results && (
        <>
          <div className="results-section">
            <h2>Your Retirement Projection</h2>
            <div className="results-summary">
              <div className="result-card primary">
                <h3>Projected Savings at Retirement</h3>
                <div className="amount">{currencyFmt(results.projectedSavings, results.currency)}</div>
                <p>At age {num(formData.retirementAge)}</p>
              </div>
              <div className="result-card">
                <h3>Total Contributions</h3>
                <div className="amount">{currencyFmt(results.totalContributions, results.currency)}</div>
                <p>Over {results.yearsToRetirement} years</p>
              </div>
              <div className="result-card">
                <h3>Investment Returns</h3>
                <div className="amount">{currencyFmt(results.totalReturns, results.currency)}</div>
                <p>Compound growth</p>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h2>Savings Growth Over Time</h2>
            {chartData && (
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          <div className="breakdown-section">
            <h2>Year-by-Year Breakdown</h2>
            <div className="breakdown-table">
              <table>
                <thead>
                  <tr>
                    <th>Age</th>
                    <th>Start Balance</th>
                    <th>Contributions</th>
                    <th>Returns</th>
                    <th>End Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyBreakdown.map((row, i) => (
                    <tr key={i}>
                      <td>{row.year}</td>
                      <td>{currencyFmt(row.startBalance, results.currency)}</td>
                      <td>{currencyFmt(row.contributions, results.currency)}</td>
                      <td>{currencyFmt(row.returns, results.currency)}</td>
                      <td>{currencyFmt(row.endBalance, results.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RetirementCalculator

