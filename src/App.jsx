import React from 'react'
import RetirementCalculator from './components/RetirementCalculator'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Retirement Savings Calculator</h1>
        <p>Plan your financial future with confidence</p>
      </header>
      
      <div className="app-container">
        {/* Ad placement area - sidebar */}
        <aside className="ad-sidebar">
          <div className="ad-placeholder">
            <p>Google AdSense</p>
            <small>Sidebar Placement</small>
          </div>
        </aside>
        
        {/* Main calculator content */}
        <main className="main-content">
          <RetirementCalculator />
          
          {/* Ad placement area - below results */}
          <div className="ad-below-results">
            <div className="ad-placeholder">
              <p>Google AdSense</p>
              <small>Below Results Placement</small>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="app-footer">
        <p>&copy; 2024 Retirement Savings Calculator. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
