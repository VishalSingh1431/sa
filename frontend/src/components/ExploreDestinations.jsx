import { useState, useEffect } from 'react'
import DestinationCard from './card/DestinationCard'
import { destinationsAPI } from '../config/api'

function ExploreDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const response = await destinationsAPI.getAllDestinations()
      setDestinations(response.destinations || [])
    } catch (error) {
      console.error('Error fetching destinations:', error)
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  // Duplicate destinations for seamless infinite scroll
  const duplicatedDestinations = [...destinations, ...destinations]

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🌍
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Explore Destinations
              </h2>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading destinations...</p>
          </div>
        </div>
      </section>
    )
  }

  if (destinations.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 overflow-x-hidden overflow-y-visible">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🌍
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Explore Destinations
            </h2>
          </div>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="relative py-8">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Content */}
          <div className="overflow-x-hidden overflow-y-visible">
            <div className="flex gap-6 md:gap-8 animate-scroll py-4">
              {duplicatedDestinations.map((destination, index) => (
                <div key={`${destination.id}-${index}`} className="flex-shrink-0 px-2">
                  <DestinationCard destination={destination} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExploreDestinations

