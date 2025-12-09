import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Home from './pages/Home'
import ProductPage from './pages/ProductPage'
import AdminTrips from './pages/AdminTrips'
import AdminCertificates from './pages/AdminCertificates'
import AdminDestinations from './pages/AdminDestinations'
import AdminReviews from './pages/AdminReviews'
import AdminWrittenReviews from './pages/AdminWrittenReviews'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trip/:id" element={<ProductPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/trips" element={<AdminTrips />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/destinations" element={<AdminDestinations />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/written-reviews" element={<AdminWrittenReviews />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  )
}

export default App
