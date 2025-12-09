import { useState, useEffect } from 'react'

const bannerImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=60',
    title: 'Discover Amazing Destinations',
    subtitle: 'Explore the world with us'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=60',
    title: 'Unforgettable Adventures',
    subtitle: 'Create memories that last forever'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab6c8?auto=format&fit=crop&w=1600&q=60',
    title: 'Travel in Style',
    subtitle: 'Premium experiences at your fingertips'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73bb2?auto=format&fit=crop&w=1600&q=60',
    title: 'Journey Beyond Boundaries',
    subtitle: 'Discover new horizons with confidence'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=60',
    title: 'Your Next Adventure Awaits',
    subtitle: 'Start planning your perfect trip today'
  }
]

function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length)
  }

  return (
    <section className="w-full bg-gray-50 py-8">
      <div className="mx-auto w-full px-4 md:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
          {bannerImages.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-12 lg:px-16 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-2xl">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl max-w-xl">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all z-10"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all z-10"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BannerSlider

