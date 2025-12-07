import { useState } from 'react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What travel services do you offer?",
      answer: "We offer a wide range of travel services including adventure tours, group travel packages, custom itineraries, travel insurance, and 24/7 customer support. Whether you're looking for a solo adventure or a group trip, we have something for everyone."
    },
    {
      question: "How do I book a trip?",
      answer: "Booking a trip is easy! Simply browse our upcoming trips, select your preferred destination, and click on the trip to view details. You can then proceed to book directly through our website or contact us for personalized assistance."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Our cancellation policy varies depending on the type of trip and timing. Generally, cancellations made 30 days or more before departure receive a full refund minus processing fees. Cancellations made 15-30 days before receive a 50% refund. For specific details, please refer to your booking confirmation or contact our support team."
    },
    {
      question: "Do you provide travel insurance?",
      answer: "Yes, we offer comprehensive travel insurance options to protect your investment. Our travel insurance covers trip cancellation, medical emergencies, baggage loss, and other travel-related incidents. You can add travel insurance during the booking process or contact us for more information."
    },
    {
      question: "Can I customize my travel itinerary?",
      answer: "Absolutely! We specialize in creating custom itineraries tailored to your preferences, budget, and travel style. Simply contact us with your requirements, and our travel experts will work with you to design the perfect trip."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit cards, debit cards, bank transfers, and digital wallets. Payment plans are also available for select trips. All transactions are secure and encrypted for your safety."
    },
    {
      question: "Do you offer group discounts?",
      answer: "Yes, we offer special discounts for group bookings! Groups of 5 or more typically receive a 10% discount, and groups of 10 or more can receive up to 15% off. Contact us for group booking inquiries and custom group packages."
    },
    {
      question: "What should I do if I have an emergency during my trip?",
      answer: "We provide 24/7 emergency support for all our travelers. You'll receive an emergency contact number before your trip departure. Our team is available around the clock to assist with any emergencies, medical issues, or travel disruptions you may encounter."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#017233] to-[#01994d] flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ❓
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our travel services, booking process, and policies.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 md:px-8 md:py-6 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#017233]/20 transition-all"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-[#017233] transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 md:px-8 md:pb-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#017233] to-[#01994d] text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Contact Us
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQ

