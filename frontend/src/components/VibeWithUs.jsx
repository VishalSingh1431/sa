import VideoCard from './card/VideoCard'

const videos = [
  {
    id: 1,
    title: 'Adventure Awaits',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 2,
    title: 'Mountain Views',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1464822759843-d0f9c0d5c51d?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    title: 'Beach Paradise',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 4,
    title: 'City Lights',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 5,
    title: 'Nature Escape',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 6,
    title: 'Desert Journey',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 7,
    title: 'Tropical Vibes',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 8,
    title: 'Sunset Dreams',
    src: '/video/Slider.mp4',
    poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60'
  }
]

function VibeWithUs() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Vibe with Us
          </h2>
          <p className="text-gray-600 text-lg">
            Experience the world through our lens
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default VibeWithUs

