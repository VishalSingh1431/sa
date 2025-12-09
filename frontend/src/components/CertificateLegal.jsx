import { useState, useEffect } from 'react'
import CertificateCard from './card/CertificateCard'
import { certificatesAPI } from '../config/api'

function CertificateLegal() {
  const [certificates, setCertificates] = useState([])
  const [currentIndices, setCurrentIndices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    if (certificates.length > 0) {
      const initialIndices = {}
      certificates.forEach((cert) => {
        initialIndices[cert.id] = 0
      })
      setCurrentIndices(initialIndices)

      const intervals = certificates.map((cert) => {
        if (cert.images && cert.images.length > 0) {
          return setInterval(() => {
            setCurrentIndices((prev) => ({
              ...prev,
              [cert.id]: (prev[cert.id] + 1) % cert.images.length
            }))
          }, 3500)
        }
        return null
      }).filter(Boolean)

      return () => {
        intervals.forEach((interval) => clearInterval(interval))
      }
    }
  }, [certificates])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await certificatesAPI.getAllCertificates()
      setCertificates(response.certificates || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      setCertificates([])
    } finally {
      setLoading(false)
    }
  }

  const goToSlide = (certId, index) => {
    setCurrentIndices((prev) => ({ ...prev, [certId]: index }))
  }

  if (loading) {
    return (
      <section className="w-full bg-white py-12">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Certificate & Legal
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </section>
    )
  }

  if (certificates.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-white py-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Certificate & Legal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              currentIndex={currentIndices[certificate.id] || 0}
              onIndexChange={goToSlide}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CertificateLegal

