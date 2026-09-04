import { Link } from 'react-router-dom'
import Brand from '../components/Brand'

export default function Landing(){
  const modules=[
    ['🌾','Yield forecasting','Estimate future crop yield and production from crop, season, location and field inputs.'],
    ['☁️','Weather analysis','Search real locations, review current weather and a seven-day field-weather outlook.'],
    ['🧪','Soil records','Store measured pH, N-P-K, organic carbon, moisture and soil type with your farm records.'],
    ['📊','Farm analytics','Review your forecast history, crop activity and seasonal summaries in one place.'],
    ['💡','Recommendations','Receive data-driven water, input, soil and crop-planning guidance from your saved records.'],
    ['🛡️','Admin control','Manage farmers, farms, platform activity and the original agricultural dataset.'],
  ]
  return <div className="landing">
    <header className="landing-nav wrap"><Brand/><nav><a href="#platform">Platform</a><a href="#workflow">Workflow</a><a href="#data">Data</a></nav><div className="nav-actions"><Link className="btn ghost" to="/login">Sign in</Link><Link className="btn primary" to="/register">Create farmer account</Link></div></header>
    <main>
      <section className="hero wrap">
        <div className="hero-copy"><span className="pill">Agricultural productivity workspace</span><h1>Plan crops with <em>field data, weather and farm insights.</em></h1><p>YieldSense AI brings crop yield forecasting, weather analysis, soil records, farm analytics and agricultural recommendations into one farmer-friendly platform.</p><div className="hero-actions"><Link className="btn primary large" to="/register">Start with a farmer account →</Link><Link className="btn text" to="/login">Farmer / Admin sign in</Link></div><div className="trust-row"><span>✓ Farmer & Admin access</span><span>✓ Original agricultural records</span><span>✓ No Docker required</span></div></div>
        <div className="hero-visual"><div className="field-card"><div className="field-top"><span>Farm intelligence</span><span className="status-badge">READY</span></div><div className="crop-illustration"><div className="sun"/><div className="hill h1"/><div className="hill h2"/><div className="sprout">🌾</div></div><div className="forecast-number"><strong>One</strong><span>centralized farm workspace</span></div><div className="mini-grid"><div><span>Forecast</span><strong>Yield</strong></div><div><span>Assess</span><strong>Weather</strong></div><div><span>Track</span><strong>Soil</strong></div></div></div></div>
      </section>
      <section id="data" className="stats-band"><div className="wrap stat-grid"><div><strong>19,689</strong><span>original crop records</span></div><div><strong>55</strong><span>crop categories</span></div><div><strong>30</strong><span>states represented</span></div><div><strong>1997–2020</strong><span>historical dataset years</span></div></div></section>
      <section id="platform" className="section wrap"><div className="section-head"><span className="eyebrow">Platform modules</span><h2>Everything in the project brief, organized around the farmer workflow.</h2><p>Public registration creates farmer accounts. Administrators use a separate secure account created from the backend.</p></div><div className="feature-grid module-grid">{modules.map(([i,t,p])=><article className="feature-card" key={t}><span className="feature-icon">{i}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>
      <section id="workflow" className="section soft-section"><div className="wrap"><div className="section-head left"><span className="eyebrow">Farmer workflow</span><h2>Collect → forecast → analyze → improve.</h2></div><div className="steps">{[['01','Create farm profile','Save farm location, cultivated area, primary crop, irrigation type and optional coordinates.'],['02','Add field information','Enter rainfall, fertilizer, pesticide and soil-test measurements from your real farm records.'],['03','Forecast & review','Generate yield and production forecasts, compare against relevant historical records and keep a history.'],['04','Use current context','Check real weather and review practical recommendations based on your latest saved information.']].map(([n,t,p])=><div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></div>)}</div></div></section>
    </main>
    <footer className="footer"><div className="wrap"><Brand/><p>YieldSense AI • Crop Yield Prediction & Agricultural Productivity Forecasting System</p></div></footer>
  </div>
}
