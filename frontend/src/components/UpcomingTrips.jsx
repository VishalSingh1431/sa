import { useMemo, useState, useEffect } from 'react'
import { tripsAPI } from '../config/api'
import TripCard from './card/TripCard'
import { Loader2 } from 'lucide-react'

const filters = [
  'All',
  'Meghalaya',
  'Spiti Valley',
  'Tirthan Valley',
  'Himachal Pradesh',
  'Shimla',
  'Varanasi',
  'Rishikesh',
  'Kerala Backwaters'
]

function UpcomingTrips() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const response = await tripsAPI.getAllTrips()
      setTrips(response.trips || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const visibleTrips = useMemo(() => {
    if (activeFilter === 'All') return trips
    return trips.filter((trip) => trip.location === activeFilter)
  }, [activeFilter, trips])

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 lg:p-12">
            {/* Header Card */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    ✈️
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    Popular Trips
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border-2 border-[#017233] bg-white text-[#017233] px-6 py-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap hover:bg-[#017233] hover:text-white shadow-md hover:shadow-lg"
                >
                  See All
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg ${
                      activeFilter === filter
                        ? 'border-[#017233] bg-gradient-to-br from-[#017233] to-[#01994d] text-white shadow-lg'
                        : 'border-gray-200 text-gray-700 hover:border-[#017233] hover:text-[#017233] bg-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Trips Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : visibleTrips.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No trips available at the moment
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {visibleTrips.slice(0, 8).map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpcomingTrips

