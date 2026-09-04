import { Link } from 'react-router-dom'
export default function Brand({compact=false}){
  return <Link to="/" className="brand" aria-label="YieldSense AI home">
    <span className="brand-mark">YS</span>
    {!compact&&<span><strong>YieldSense</strong><small>AI</small></span>}
  </Link>
}
