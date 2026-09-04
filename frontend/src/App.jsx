import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/FarmerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
 return <Routes>
   <Route path="/" element={<Landing/>}/>
   <Route path="/login" element={<Login/>}/>
   <Route path="/register" element={<Register/>}/>
   <Route path="/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard/></ProtectedRoute>}/>
   <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>
}
