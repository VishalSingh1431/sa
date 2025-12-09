import { Link } from 'react-router-dom'
import SnakeCard from '../SnakeCard'

function TripCard({ trip }) {
  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-2xl cursor-pointer"
    >
      <SnakeCard className="absolute inset-0 rounded-2xl">
        {/* Inner content wrapper */}
        <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 z-0">
          {/* Image Section */}
          <div className="relative h-40 sm:h-44 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
            <img 
              src={trip.image} 
              alt={trip.title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {trip.freebies && (
              <span className="absolute left-3 top-3 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg z-10">
                Free Goodies 🎁
              </span>
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-2 p-4 flex-grow">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">⏱️ {trip.nights} / {trip.duration}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#017233] transition-colors leading-tight">{trip.title}</h3>
            <p className="text-sm text-gray-600 font-medium">{trip.location}</p>

            <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">{trip.price}</span>
              <span className="text-xs text-gray-400 line-through">{trip.oldPrice}</span>
              <span className="text-xs font-bold text-[#F43F5E] bg-red-50 px-2 py-0.5 rounded-full">{trip.discount}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <span>📅</span>
              <span className="line-clamp-1">{trip.departures.slice(0, 2).join(', ')}{trip.departures.length > 2 ? '...' : ''}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs font-bold uppercase tracking-widest text-[#017233] bg-[#017233]/10 px-2.5 py-1 rounded-full">
                {trip.month}
              </span>
              <button
                type="button"
                className="rounded-full border-2 border-[#017233] bg-white text-[#017233] px-3 py-1 text-xs font-bold transition-all duration-300 hover:bg-[#017233] hover:text-white shadow-md hover:shadow-lg"
                onClick={(e) => e.preventDefault()}
              >
                View
              </button>
            </div>
          </div>
        </div>
      </SnakeCard>
    </Link>
  )
}

export default TripCard
