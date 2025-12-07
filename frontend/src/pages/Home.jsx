import HeroVideo from '../components/HeroVideo'
import UpcomingTrips from '../components/UpcomingTrips'
import ExploreDestinations from '../components/ExploreDestinations'
import BannerSlider from '../components/BannerSlider'
import CertificateLegal from '../components/CertificateLegal'
import VibeWithUs from '../components/VibeWithUs'
import Reviews from '../components/Reviews'
import WrittenReviews from '../components/WrittenReviews'
import FAQ from '../components/FAQ'
import ContactUs from '../components/ContactUs'

function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      <HeroVideo />
      <UpcomingTrips />
      <ExploreDestinations />
      <BannerSlider />
      <CertificateLegal />
      <VibeWithUs />
      <Reviews />
      <WrittenReviews />
      <FAQ />
      <ContactUs />
    </div>
  )
}

export default Home

