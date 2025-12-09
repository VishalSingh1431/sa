import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { tripsAPI, enquiriesAPI } from '../config/api'
import { Loader2, Calendar, Users, Mail, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState(null)
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [enquiryData, setEnquiryData] = useState({
    selectedMonth: '',
    numberOfTravelers: 1,
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchTrip()
  }, [id])

  const fetchTrip = async () => {
    try {
      setLoading(true)
      const response = await tripsAPI.getTripById(id)
      if (response.trip) {
        setTrip(response.trip)
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#017233] text-white rounded-lg hover:bg-[#015a28] transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  // Get content from trip data (now stored in database)
  const getTripContent = (tripData) => {
    const contentMap = {
      'Meghalaya': {
        subtitle: '6 Days Adventure Trip',
        intro: 'Meghalaya, the "Abode of Clouds," offers an unparalleled backpacking experience through lush green valleys, cascading waterfalls, and unique living root bridges. This adventure takes you through some of the most pristine and untouched landscapes in Northeast India, where nature and culture blend seamlessly.',
        video: trip.video || '/video/Slider.mp4',
        gallery: trip.gallery || [
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60'
        ],
        reviews: trip.reviews || [
          {
            rating: 5,
            text: 'An amazing experience! The trip was well-organized and the destination exceeded all expectations. Highly recommended!',
            author: 'Recent Traveller'
          }
        ],
        whyVisit: [
          'Scenic landscapes with rolling hills and dense forests',
          'Iconic living root bridges - a UNESCO World Heritage marvel',
          'Majestic waterfalls including Nohkalikai, Seven Sisters, and Elephant Falls',
          'Rich Khasi and Garo tribal culture with warm, welcoming locals',
          'Offbeat caves like Mawsmai and Krem Liat Prah for spelunking',
          'Unique cuisine featuring bamboo shoots, smoked pork, and Jadoh',
          'Pristine lakes like Umiam and Dawki for water activities',
          'Misty mountains and cool climate perfect for trekking'
        ],
        itinerary: [
          {
            day: 'Day 1',
            title: 'Arrival in Shillong',
            activities: 'Arrive at Shillong, check into accommodation. Evening exploration of local markets and Shillong Peak for sunset views. Welcome dinner with local cuisine.'
          },
          {
            day: 'Day 2',
            title: 'Cherrapunji & Living Root Bridges',
            activities: 'Early morning drive to Cherrapunji. Visit Nohkalikai Falls, Seven Sisters Falls, and explore the famous double-decker living root bridge at Nongriat. Moderate trek through lush forests.'
          },
          {
            day: 'Day 3',
            title: 'Mawsmai Caves & Local Villages',
            activities: 'Explore Mawsmai limestone caves. Visit local Khasi villages to experience traditional lifestyle. Afternoon at Wah Kaba Falls. Cultural interaction with locals.'
          },
          {
            day: 'Day 4',
            title: 'Dawki & Umngot River',
            activities: 'Journey to Dawki to witness the crystal-clear Umngot River. Optional boating and cliff jumping. Visit Indo-Bangladesh border. Return to Shillong via scenic routes.'
          },
          {
            day: 'Day 5',
            title: 'Elephant Falls & Local Exploration',
            activities: 'Visit Elephant Falls and Shillong Peak. Explore local markets for handicrafts. Optional visit to Don Bosco Museum for cultural insights. Evening at leisure.'
          },
          {
            day: 'Day 6',
            title: 'Departure',
            activities: 'Breakfast and check-out. Transfer to airport/railway station with memories of Meghalaya\'s natural beauty and cultural richness.'
          }
        ],
        included: [
          'Accommodation in comfortable guesthouses/hotels (twin sharing)',
          'All meals (breakfast, lunch, dinner) as per itinerary',
          'Transportation in private vehicles (AC/non-AC as per group size)',
          'Experienced local guide throughout the trip',
          'Entry fees to monuments, caves, and waterfalls',
          'Permits and permissions for restricted areas',
          'First aid kit and basic medical support',
          'Trip leader assistance'
        ],
        notIncluded: [
          'Transportation to/from Shillong (flights/trains)',
          'Personal expenses and shopping',
          'Extra meals and beverages not mentioned',
          'Optional activities like boating, paragliding',
          'Travel insurance (highly recommended)',
          'Tips and gratuities',
          'Any expenses due to weather or unforeseen circumstances',
          'GST and other taxes'
        ],
        notes: [
          'Arrival: Reach Shillong by flight (Umroi Airport) or train to Guwahati followed by road transfer (3-4 hours)',
          'Departure: Plan departure from Shillong after 12 PM on Day 6',
          'Weather: Meghalaya experiences heavy rainfall. Pack raincoats, waterproof bags, and quick-dry clothing',
          'Fitness: Moderate fitness level required. Day 2 involves a 3-4 hour trek with steep steps',
          'Accommodation: Basic to mid-range guesthouses. Hot water may not be available at all locations',
          'Age restriction: Suitable for ages 12-60. Children below 12 need parental supervision',
          'Safety: Follow guide instructions, especially during treks and cave explorations',
          'Local conditions: Itinerary may change due to weather, road conditions, or local restrictions'
        ],
        faq: [
          {
            question: 'What is the best time to visit Meghalaya?',
            answer: 'The best time is from October to May when the weather is pleasant. Monsoon (June-September) offers lush greenery but heavy rainfall may affect outdoor activities.'
          },
          {
            question: 'How many days are enough for Meghalaya?',
            answer: '6-7 days are ideal to explore the main attractions including Shillong, Cherrapunji, living root bridges, and waterfalls. For a more relaxed trip, 8-10 days would be better.'
          },
          {
            question: 'What is the cost range for this trip?',
            answer: 'The trip costs ₹22,999 per person (excluding transportation to/from Shillong). Additional expenses for personal shopping, optional activities, and tips may apply.'
          },
          {
            question: 'Can the itinerary be customized?',
            answer: 'Yes, we can customize the itinerary based on your preferences, group size, and duration. Contact us for personalized packages.'
          },
          {
            question: 'What is the group size?',
            answer: 'We typically operate with groups of 8-15 people. Smaller groups ensure better experience and personalized attention.'
          },
          {
            question: 'Is Meghalaya safe for solo travelers?',
            answer: 'Yes, Meghalaya is generally safe. However, we recommend joining group trips for better experience and safety, especially for first-time visitors.'
          }
        ]
      },
      'Spiti Valley': {
        subtitle: '7 Days Winter Expedition',
        intro: 'Spiti Valley, often called "Little Tibet," is a high-altitude desert valley that transforms into a winter wonderland. This expedition takes you through snow-clad mountains, ancient monasteries, and remote villages, offering an authentic Himalayan experience in one of India\'s most pristine regions.',
        video: trip.video || '/video/Slider.mp4',
        gallery: trip.gallery || [
          'https://images.unsplash.com/photo-1523906630133-f6934a1ab6c8?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=60'
        ],
        reviews: trip.reviews || [
          {
            rating: 5,
            text: 'An amazing experience! The trip was well-organized and the destination exceeded all expectations. Highly recommended!',
            author: 'Recent Traveller'
          }
        ],
        whyVisit: [
          'Breathtaking snow-covered landscapes and frozen rivers',
          'Ancient Buddhist monasteries like Key, Tabo, and Dhankar',
          'Stargazing opportunities in one of India\'s darkest skies',
          'Unique high-altitude desert ecosystem',
          'Warm hospitality of Spitian locals',
          'Adventure activities like snow trekking and ice climbing',
          'Photography paradise with dramatic mountain vistas',
          'Cultural immersion in Tibetan-influenced traditions'
        ],
        itinerary: [
          {
            day: 'Day 1',
            title: 'Arrival in Manali',
            activities: 'Arrive in Manali, acclimatization day. Briefing session about the expedition. Explore local markets and prepare for the journey ahead.'
          },
          {
            day: 'Day 2',
            title: 'Manali to Kaza via Rohtang',
            activities: 'Early morning departure to Kaza (200 km, 8-10 hours). Cross Rohtang Pass (subject to weather). En route visit Key Monastery. Check into guesthouse in Kaza.'
          },
          {
            day: 'Day 3',
            title: 'Kaza - Langza - Hikkim - Komic',
            activities: 'Visit the world\'s highest post office in Hikkim. Explore fossil village Langza and highest motorable village Komic. Return to Kaza for overnight stay.'
          },
          {
            day: 'Day 4',
            title: 'Kaza - Tabo - Dhankar',
            activities: 'Visit ancient Tabo Monastery (1000+ years old). Explore Dhankar Monastery perched on a cliff. Witness stunning views of Spiti River confluence.'
          },
          {
            day: 'Day 5',
            title: 'Kaza - Pin Valley - Mud Village',
            activities: 'Excursion to Pin Valley National Park. Visit Mud Village and experience local life. Optional snow activities. Return to Kaza.'
          },
          {
            day: 'Day 6',
            title: 'Kaza to Manali',
            activities: 'Early morning departure from Kaza. Cross Rohtang Pass again. Arrive in Manali by evening. Farewell dinner and trip conclusion.'
          },
          {
            day: 'Day 7',
            title: 'Departure',
            activities: 'Breakfast and check-out. Transfer to airport/bus stand. End of expedition with unforgettable memories.'
          }
        ],
        included: [
          'Accommodation in guesthouses/homestays (twin sharing)',
          'All meals (vegetarian meals, local cuisine)',
          'Transportation in 4x4 vehicles suitable for mountain terrain',
          'Experienced local guide and driver',
          'Monastery entry fees and permits',
          'Inner Line Permits for Spiti Valley',
          'First aid kit and oxygen cylinders',
          'Trip leader support'
        ],
        notIncluded: [
          'Transportation to/from Manali',
          'Personal expenses and shopping',
          'Extra meals and beverages',
          'Optional activities and equipment rental',
          'Travel insurance (mandatory)',
          'Tips and gratuities',
          'Expenses due to road closures or weather',
          'GST and taxes'
        ],
        notes: [
          'Arrival: Reach Manali by bus from Delhi/Chandigarh or flight to Bhuntar Airport',
          'Departure: Plan departure from Manali after 10 AM on Day 7',
          'Altitude: Spiti is at 12,500+ feet. Acclimatization is crucial. Those with heart/lung conditions should consult a doctor',
          'Weather: Extreme cold (-10°C to -20°C). Carry heavy woolens, thermal wear, gloves, and proper winter gear',
          'Fitness: Good physical fitness required. Some walking at high altitudes involved',
          'Age restriction: Recommended for ages 18-55. Not suitable for children or elderly',
          'Road conditions: Roads may be blocked due to snow. Itinerary subject to weather and road conditions',
          'Accommodation: Basic facilities. Hot water and heating may be limited. No luxury hotels in Spiti'
        ],
        faq: [
          {
            question: 'What is the best time to visit Spiti Valley?',
            answer: 'Winter (December-February) for snow experience, or summer (May-October) for easier access. Winter expeditions are more challenging but offer unique experiences.'
          },
          {
            question: 'How many days are enough for Spiti Valley?',
            answer: '7-8 days are ideal for a comprehensive Spiti experience. Shorter trips (5-6 days) are possible but rushed.'
          },
          {
            question: 'What is the cost range?',
            answer: 'The winter expedition costs ₹18,999 per person. Additional costs for transportation to Manali, travel insurance, and personal expenses.'
          },
          {
            question: 'Is Spiti Valley safe in winter?',
            answer: 'Yes, with proper preparation and experienced guides. However, weather can be unpredictable. Travel insurance and proper gear are essential.'
          },
          {
            question: 'What is the group size?',
            answer: 'Groups of 6-12 people for better vehicle management and personalized experience in challenging conditions.'
          },
          {
            question: 'Do I need special permits?',
            answer: 'Yes, Inner Line Permits are required for Spiti Valley. We arrange these as part of the package.'
          }
        ]
      }
    }

    // Default content for other locations
    const defaultContent = {
      subtitle: `${trip.duration} Adventure Trip`,
      intro: `${trip.location} offers an incredible backpacking experience with stunning natural beauty, rich culture, and unique adventures. This carefully curated trip takes you through the best that this destination has to offer, ensuring an unforgettable journey filled with memories.`,
      video: trip.video || '/video/Slider.mp4',
      gallery: trip.gallery || [
        trip.image,
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=60'
      ],
      reviews: trip.reviews || [
        {
          rating: 5,
          text: 'An amazing experience! The trip was well-organized and the destination exceeded all expectations. Highly recommended!',
          author: 'Recent Traveller'
        }
      ],
      whyVisit: [
        'Scenic landscapes and natural beauty',
        'Rich cultural heritage and local traditions',
        'Unique experiences and offbeat locations',
        'Friendly locals and warm hospitality',
        'Delicious local cuisine',
        'Adventure activities and outdoor experiences',
        'Photography opportunities',
        'Peaceful and rejuvenating environment'
      ],
      itinerary: Array.from({ length: parseInt(trip.duration) }, (_, i) => ({
        day: `Day ${i + 1}`,
        title: i === 0 ? 'Arrival' : i === parseInt(trip.duration) - 1 ? 'Departure' : 'Exploration Day',
        activities: i === 0 
          ? 'Arrive at destination, check into accommodation. Brief orientation and welcome dinner.'
          : i === parseInt(trip.duration) - 1
          ? 'Breakfast and check-out. Transfer to departure point with wonderful memories.'
          : `Full day of exploration including key attractions, local experiences, and cultural immersion.`
      })),
      included: [
        'Accommodation (twin sharing)',
        'All meals as per itinerary',
        'Transportation during the trip',
        'Experienced local guide',
        'Entry fees to monuments and attractions',
        'Basic first aid support',
        'Trip leader assistance'
      ],
      notIncluded: [
        'Transportation to/from destination',
        'Personal expenses and shopping',
        'Extra meals and beverages',
        'Optional activities',
        'Travel insurance',
        'Tips and gratuities',
        'GST and taxes'
      ],
      notes: [
        'Arrival: Please reach the starting point as per the itinerary',
        'Departure: Plan your departure after the trip concludes',
        'Weather: Check weather conditions and pack accordingly',
        'Fitness: Moderate fitness level recommended',
        'Accommodation: Basic to mid-range facilities',
        'Safety: Follow guide instructions at all times',
        'Local conditions: Itinerary may change due to weather or local restrictions'
      ],
      faq: [
        {
          question: 'What is the best time to visit?',
          answer: 'The destination is best visited during the recommended months for optimal weather and experiences.'
        },
        {
          question: 'How many days are enough?',
          answer: `The ${trip.duration} trip is well-planned to cover major attractions. Extended stays can be arranged upon request.`
        },
        {
          question: 'What is the cost range?',
          answer: `The trip costs ${trip.price} per person. Additional expenses for transportation, personal shopping, and optional activities apply.`
        },
        {
          question: 'Can the itinerary be customized?',
          answer: 'Yes, we offer customized itineraries based on your preferences, group size, and duration. Contact us for details.'
        },
        {
          question: 'What is the group size?',
          answer: 'We typically operate with groups of 8-15 people to ensure personalized attention and better experience.'
        },
        {
          question: 'Is it safe for solo travelers?',
          answer: 'Yes, the destination is safe. We recommend joining group trips for better experience and safety.'
        }
      ]
    }

    // If trip has all content fields, use them directly
    if (tripData.intro && tripData.whyVisit && tripData.itinerary) {
      return {
        subtitle: tripData.subtitle || `${tripData.duration} Adventure Trip`,
        intro: tripData.intro,
        video: tripData.videoUrl || tripData.video || '/video/Slider.mp4',
        gallery: tripData.gallery && tripData.gallery.length > 0 ? tripData.gallery : [
          tripData.imageUrl || tripData.image,
          'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=60'
        ],
        reviews: tripData.reviews && tripData.reviews.length > 0 ? tripData.reviews : [
          {
            rating: 5,
            text: 'An amazing experience! The trip was well-organized and the destination exceeded all expectations. Highly recommended!',
            author: 'Recent Traveller'
          }
        ],
        whyVisit: tripData.whyVisit || [],
        itinerary: tripData.itinerary || [],
        included: tripData.included || [],
        notIncluded: tripData.notIncluded || [],
        notes: tripData.notes || [],
        faq: tripData.faq || [],
      }
    }

    // Fallback to location-based content for backward compatibility
    return contentMap[tripData.location] || defaultContent
  }

  const content = getTripContent(trip)

  const validateEnquiryForm = () => {
    const newErrors = {};
    
    if (!enquiryData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!enquiryData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEnquiryForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const monthName = enquiryData.selectedMonth 
        ? new Date(enquiryData.selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Not specified';

      await enquiriesAPI.createEnquiry({
        tripId: trip.id,
        tripTitle: trip.title,
        tripLocation: trip.location,
        tripPrice: trip.price,
        selectedMonth: monthName,
        numberOfTravelers: enquiryData.numberOfTravelers,
        name: enquiryData.name.trim(),
        email: enquiryData.email.trim(),
        phone: enquiryData.phone.trim() || null,
        message: enquiryData.message.trim() || null,
      });

      setSubmitted(true);
      toast.success('Enquiry submitted successfully! We\'ll get back to you soon.');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans">
      {/* Hero Section with Video */}
      <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
        <video 
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={content.video} type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          <img 
            src={trip.imageUrl || trip.image} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 flex items-center justify-center">
          <div className="text-center text-white px-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-light drop-shadow-lg">
              {trip.location} {content.subtitle}
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm md:text-base">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                ⏱️ {trip.duration}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                📍 {trip.location}
              </span>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 lg:p-12 space-y-8">
            {/* Introduction Card */}
            <section className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-8 md:p-10 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ℹ
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  About This Trip
                </h2>
              </div>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{content.intro}</p>
            </section>

            {/* Why Visit Card */}
            <section className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 md:p-10 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ✨
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Why Visit {trip.location}?
                </h2>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {content.whyVisit.map((reason, index) => (
                  <li 
                    key={index} 
                    className="group flex items-start gap-4 bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#017233]/30"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                    <span className="text-gray-700 text-base leading-relaxed pt-1">{reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Itinerary Breakdown Card */}
            <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-8 md:p-10 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  📅
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Itinerary Breakdown
                </h2>
              </div>
              <div className="space-y-3">
                {content.itinerary.map((day, index) => {
                  const isExpanded = expandedDay === index
                  // Split activities into points (by periods, then filter empty strings)
                  const activitiesPoints = typeof day.activities === 'string' 
                    ? day.activities.split(/[.!?]+/).filter(point => point.trim().length > 0).map(p => p.trim())
                    : Array.isArray(day.activities) 
                    ? day.activities 
                    : [day.activities]
                  
                  return (
                    <div 
                      key={index} 
                      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200"
                    >
                      {/* Clickable Header */}
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : index)}
                        className="w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer focus:outline-none rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white font-bold shadow-md">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                              <span className="text-[#017233]">{day.day}:</span> {day.title}
                            </h3>
                          </div>
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#017233]' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Collapsible Content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-5 pl-20">
                          <ul className="space-y-2.5">
                            {activitiesPoints.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#017233] mt-2.5"></div>
                                <span className="text-gray-700 leading-relaxed text-sm md:text-base">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* What's Included / Not Included Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    ✓
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What's Included</h2>
                </div>
                <ul className="space-y-4">
                  {content.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#017233] text-white text-sm flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">✓</span>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-8 border border-red-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    ✗
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What's Not Included</h2>
                </div>
                <ul className="space-y-4">
                  {content.notIncluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">✗</span>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Notes / Important Info Card */}
            <section className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-l-4 border-yellow-500 rounded-2xl shadow-lg p-8 md:p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ⚠
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Notes / Important Information</h2>
              </div>
              <ul className="space-y-4">
                {content.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-4 group hover:bg-white/80 transition-colors">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 text-white text-sm flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform font-bold">⚠</span>
                    <span className="text-gray-800 leading-relaxed text-base">{note}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Gallery / Photos & Videos / Reviews Card */}
            <section className="bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-lg p-8 md:p-10 border border-pink-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  📸
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Gallery & Traveller Experiences
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {content.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group relative"
                  >
                    <img 
                      src={image} 
                      alt={`${trip.title} gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#017233]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
              {content.reviews && content.reviews.length > 0 && content.reviews.map((review, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white font-bold">
                      ★
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Traveller Reviews</h3>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-4">"{review.text}"</p>
                  <p className="text-sm text-gray-500 font-semibold">- {review.author}</p>
                </div>
              ))}
            </section>

            {/* FAQ Section Card */}
            <section className="bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg p-8 md:p-10 border border-teal-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ❓
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-4">
                {content.faq.map((faq, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-[#017233] transition-colors">
                          {faq.question}
                        </h3>
                        <div className="flex items-start gap-3">
                          <span className="text-[#017233] font-bold mt-1">A:</span>
                          <p className="text-gray-700 leading-relaxed text-base md:text-lg">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Enquiry/Booking Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16">
        <section className="relative bg-gradient-to-br from-[#017233] via-[#01994d] to-[#017233] text-white p-8 md:p-12 rounded-3xl text-center shadow-2xl overflow-hidden border-4 border-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            {!submitted ? (
              <>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  Ready to Embark on This Adventure?
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-95">Send us an enquiry and we'll get back to you soon!</p>

                {/* Price Display */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                    <p className="text-sm opacity-90 mb-1">Starting from</p>
                    <p className="text-4xl md:text-5xl font-bold">{trip.price}</p>
                    {trip.oldPrice && (
                      <p className="text-sm opacity-75 mt-1 line-through">{trip.oldPrice}</p>
                    )}
                  </div>
                </div>

                {/* Enquiry Form */}
                {!showEnquiryForm ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      onClick={() => setShowEnquiryForm(true)}
                      className="bg-white text-[#017233] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Enquiry
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                      Back to Trips
                    </button>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
                    <form onSubmit={handleEnquirySubmit} className="space-y-6">
                      {/* Month Selection */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Select Month
                        </label>
                        <input
                          type="month"
                          value={enquiryData.selectedMonth}
                          onChange={(e) => setEnquiryData({ ...enquiryData, selectedMonth: e.target.value })}
                          min={new Date().toISOString().slice(0, 7)}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                          required
                        />
                      </div>

                      {/* Number of Travelers */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Number of Travelers
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setEnquiryData({ ...enquiryData, numberOfTravelers: Math.max(1, enquiryData.numberOfTravelers - 1) })}
                            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xl transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={enquiryData.numberOfTravelers}
                            onChange={(e) => setEnquiryData({ ...enquiryData, numberOfTravelers: parseInt(e.target.value) || 1 })}
                            className="w-20 px-4 py-3 rounded-xl text-gray-900 text-center font-bold text-xl focus:ring-2 focus:ring-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setEnquiryData({ ...enquiryData, numberOfTravelers: Math.min(50, enquiryData.numberOfTravelers + 1) })}
                            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xl transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={enquiryData.name}
                          onChange={(e) => {
                            setEnquiryData({ ...enquiryData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: '' });
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                          required
                        />
                        {errors.name && <p className="text-red-200 text-sm mt-1">{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={enquiryData.email}
                          onChange={(e) => {
                            setEnquiryData({ ...enquiryData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                          required
                        />
                        {errors.email && <p className="text-red-200 text-sm mt-1">{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2 flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={enquiryData.phone}
                          onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                          placeholder="+91 1234567890"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-left text-white font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Additional Message
                        </label>
                        <textarea
                          value={enquiryData.message}
                          onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none resize-none"
                          placeholder="Tell us about any special requirements or questions..."
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-white text-[#017233] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Send Enquiry
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEnquiryForm(false);
                            setEnquiryData({
                              selectedMonth: '',
                              numberOfTravelers: 1,
                              name: '',
                              email: '',
                              phone: '',
                              message: '',
                            });
                            setErrors({});
                          }}
                          className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Enquiry Submitted Successfully!</h2>
                <p className="text-lg md:text-xl mb-8 opacity-95">
                  Thank you for your interest! We'll get back to you soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setShowEnquiryForm(false);
                      setEnquiryData({
                        selectedMonth: '',
                        numberOfTravelers: 1,
                        name: '',
                        email: '',
                        phone: '',
                        message: '',
                      });
                    }}
                    className="bg-white text-[#017233] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    Send Another Enquiry
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Back to Trips
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductPage

