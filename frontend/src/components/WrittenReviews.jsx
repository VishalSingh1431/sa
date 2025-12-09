import { useState, useEffect } from 'react'
import WrittenReviewCard from './card/WrittenReviewCard'
import { writtenReviewsAPI } from '../config/api'

function WrittenReviews() {
  const [writtenReviews, setWrittenReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWrittenReviews()
  }, [])

  const fetchWrittenReviews = async () => {
    try {
      setLoading(true)
      const response = await writtenReviewsAPI.getAllWrittenReviews()
      setWrittenReviews(response.writtenReviews || [])
    } catch (error) {
      console.error('Error fetching written reviews:', error)
      setWrittenReviews([])
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8 lg:p-12">
              <div className="text-center py-12">
                <p className="text-gray-600">Loading written reviews...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (writtenReviews.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 lg:p-12">
            {/* Header Card */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ✍️
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                  Written Reviews
                </h2>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {writtenReviews.map((review) => (
                <WrittenReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="bg-gradient-to-br from-[#017233] to-[#01994d] text-white px-8 py-3 rounded-xl font-bold text-base hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WrittenReviews

