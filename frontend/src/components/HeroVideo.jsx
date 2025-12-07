import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroVideo() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="w-full px-0 pb-10 pt-0 relative">
        <div className="w-full relative">
          <video
            className="h-[90vh] w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            poster="https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=1600&q=60"
          >
            <source src="/video/Slider.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Search Bar Overlay */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-10">
            <form 
              onSubmit={handleSearch} 
              className="flex items-center gap-3 rounded-full border-2 border-gray-800 bg-gray-900/95 backdrop-blur-md px-6 py-4 shadow-2xl transition-all hover:bg-gray-900 hover:border-[#017233]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79L20 21.5 21.5 20l-5.5-6zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="search"
                placeholder="Search your trip destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent text-base text-white outline-none placeholder:text-gray-400 focus:placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="rounded-full bg-[#017233] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#01994d] hover:shadow-lg whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroVideo

