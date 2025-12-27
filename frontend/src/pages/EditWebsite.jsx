import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, User, Phone, Mail, MapPin, Link as LinkIcon, MessageCircle, Instagram, Facebook, Globe, Loader2, Youtube, CheckCircle2, XCircle, Sparkles, Navigation, Plus, X, Clock, Calendar, Gift, ShoppingBag, Map, Palette, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormInput from '../components/forms/FormInput';
import TextArea from '../components/forms/TextArea';
import CategorySelect from '../components/forms/CategorySelect';
import FileUploader from '../components/forms/FileUploader';
import SubmitButton from '../components/forms/SubmitButton';
import PlacesAutocomplete from '../components/google/PlacesAutocomplete';
import { businessAPI } from '../config/api';
import { formatPhoneNumber } from '../services/googlePlaces';
import { useRef } from 'react';

const EditWebsite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [subdomainStatus, setSubdomainStatus] = useState(null);
  const checkTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    mobileNumber: '',
    email: '',
    address: '',
    googleMapLink: '',
    whatsappNumber: '',
    description: '',
    images: [],
    existingImages: [],
    logo: null,
    existingLogo: null,
    youtubeVideo: '',
    instagram: '',
    facebook: '',
    website: '',
    navbarTagline: '',
    footerDescription: '',
    services: [],
    specialOffers: [],
    businessHours: {
      monday: { open: false, start: '09:00', end: '18:00' },
      tuesday: { open: false, start: '09:00', end: '18:00' },
      wednesday: { open: false, start: '09:00', end: '18:00' },
      thursday: { open: false, start: '09:00', end: '18:00' },
      friday: { open: false, start: '09:00', end: '18:00' },
      saturday: { open: false, start: '09:00', end: '18:00' },
      sunday: { open: false, start: '09:00', end: '18:00' },
    },
    appointmentSettings: {
      contactMethod: 'whatsapp',
      availableSlots: [],
    },
    theme: 'modern',
    preferredSlug: '',
  });

  // Load business data
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await businessAPI.getBusinessById(id);
        const business = response.business;

        // Map business data to form data
        setFormData({
          businessName: business.businessName || '',
          ownerName: business.ownerName || '',
          category: business.category || '',
          mobileNumber: business.mobile || '',
          email: business.email || '',
          address: business.address || '',
          googleMapLink: business.mapLink || '',
          whatsappNumber: business.whatsapp || '',
          description: business.description || '',
          images: [],
          existingImages: business.imagesUrl || [],
          logo: null,
          existingLogo: business.logoUrl || null,
          youtubeVideo: business.youtubeVideo || '',
          instagram: business.socialLinks?.instagram || '',
          facebook: business.socialLinks?.facebook || '',
          website: business.socialLinks?.website || '',
          navbarTagline: business.navbarTagline || '',
          footerDescription: business.footerDescription || '',
          services: business.services || [],
          specialOffers: business.specialOffers || [],
          businessHours: business.businessHours || {
            monday: { open: true, start: '09:00', end: '18:00' },
            tuesday: { open: true, start: '09:00', end: '18:00' },
            wednesday: { open: true, start: '09:00', end: '18:00' },
            thursday: { open: true, start: '09:00', end: '18:00' },
            friday: { open: true, start: '09:00', end: '18:00' },
            saturday: { open: true, start: '09:00', end: '18:00' },
            sunday: { open: true, start: '09:00', end: '18:00' },
          },
          appointmentSettings: business.appointmentSettings || {
            contactMethod: 'whatsapp',
            availableSlots: [],
          },
          theme: business.theme || 'modern',
          preferredSlug: business.slug || '',
        });
      } catch (error) {
        console.error('Error loading business:', error);
        setErrorMessage(error.message || 'Failed to load business data');
        setTimeout(() => navigate('/profile'), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Check subdomain availability
  const checkSubdomain = async (slug) => {
    if (!slug || slug.length < 3) {
      setSubdomainStatus(null);
      return;
    }

    setSubdomainStatus({ checking: true, available: null, slug, suggestions: [] });

    try {
      const response = await businessAPI.checkSubdomainAvailability(slug);
      setSubdomainStatus({
        checking: false,
        available: response.available,
        slug: response.slug,
        suggestions: response.suggestions || [],
      });
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainStatus({
        checking: false,
        available: null,
        slug,
        suggestions: [],
        error: error.message,
      });
    }
  };

  const handleSubdomainChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, preferredSlug: value }));

    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Debounce the check
    checkTimeoutRef.current = setTimeout(() => {
      if (value.length >= 3) {
        checkSubdomain(value);
      } else {
        setSubdomainStatus({ checking: false, available: null, slug: value, suggestions: [] });
      }
    }, 500);
  };

  const handleFileChange = (name, files) => {
    setFormData(prev => ({
      ...prev,
      [name]: files,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Services handlers
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '', price: '', image: null, imageUrl: null, featured: false }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const toggleServiceFeatured = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, featured: !service.featured } : service
      )
    }));
  };

  // Special Offers handlers
  const addSpecialOffer = () => {
    setFormData(prev => ({
      ...prev,
      specialOffers: [...prev.specialOffers, { title: '', description: '', expiryDate: '' }]
    }));
  };

  const removeSpecialOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      specialOffers: prev.specialOffers.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialOffer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specialOffers: prev.specialOffers.map((offer, i) =>
        i === index ? { ...offer, [field]: value } : offer
      )
    }));
  };

  // Business Hours handlers
  const updateBusinessHours = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  // Appointment handlers
  const updateAppointmentSettings = (field, value) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        [field]: value
      }
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: [...prev.appointmentSettings.availableSlots, { time: '', label: '' }]
      }
    }));
  };

  const removeTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: prev.appointmentSettings.availableSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: prev.appointmentSettings.availableSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Business category is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Full address is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Business description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    // Logo and images are optional when editing (can keep existing)
    if (formData.whatsappNumber && !/^[0-9]{10}$/.test(formData.whatsappNumber.replace(/\D/g, ''))) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare form data for update
      const updateData = {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        category: formData.category,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        googleMapLink: formData.googleMapLink,
        whatsappNumber: formData.whatsappNumber,
        description: formData.description,
        youtubeVideo: formData.youtubeVideo,
        instagram: formData.instagram,
        facebook: formData.facebook,
        website: formData.website,
        navbarTagline: formData.navbarTagline || '',
        footerDescription: formData.footerDescription || '',
        services: formData.services || [],
        specialOffers: formData.specialOffers || [],
        businessHours: formData.businessHours || {},
        appointmentSettings: formData.appointmentSettings || {},
        theme: formData.theme || 'modern',
        preferredSlug: formData.preferredSlug,
        logo: formData.logo,
        images: formData.images,
      };

      // Add service images
      formData.services.forEach((service, index) => {
        if (service.image) {
          updateData[`serviceImage_${index}`] = service.image;
        }
      });

      const response = await businessAPI.updateBusiness(id, updateData);

      const message = response.requiresApproval
        ? 'Your changes have been submitted for admin approval. They will be live once approved.'
        : 'Your changes have been saved and are live now.';

      setSuccessMessage({
        title: response.requiresApproval ? 'Changes Submitted for Approval!' : 'Website Updated Successfully!',
        message: message,
      });
      setErrorMessage(null);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating website:', error);
      setErrorMessage(error.message || 'Failed to update website. Please try again.');
      setSuccessMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading website data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Edit2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Your Website
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Update your website details, change the theme, or modify any information below.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">{successMessage.title}</h3>
                  <p className="text-sm text-green-800">{successMessage.message}</p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="mt-4 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Card - Reuse CreateWebsite form structure */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Quick Search - Auto Fill Section */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-blue-200 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quick Start: Search Your Business</h2>
                    <p className="text-sm text-gray-600">Find your business and auto-fill all details instantly</p>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Search Your Business Here
                  </label>
                  <PlacesAutocomplete
                    value={formData.address}
                    onChange={handleChange}
                    onPlaceSelect={(businessData) => {
                      if (businessData) {
                        // Auto-fill form fields with place data
                        setFormData(prev => ({
                          ...prev,
                          address: businessData.address || prev.address,
                          googleMapLink: businessData.googleMapLink || prev.googleMapLink,
                          // Only auto-fill if field is empty
                          businessName: prev.businessName || businessData.businessName || '',
                          mobileNumber: prev.mobileNumber || formatPhoneNumber(businessData.phoneNumber) || '',
                          website: prev.website || businessData.website || '',
                        }));

                        // Show success message
                        setSuccessMessage({
                          title: '✅ Business Details Extracted!',
                          message: `We've auto-filled your business details from Google. Please review and update as needed.`,
                          temporary: true,
                        });

                        // Clear temporary message after 5 seconds
                        setTimeout(() => {
                          setSuccessMessage(prev =>
                            prev?.temporary ? null : prev
                          );
                        }, 5000);
                      }
                    }}
                    placeholder="Type your business name or address (e.g., 'Restaurant in Varanasi', 'Kashi Vishwanath Temple')"
                    error={errors.address}
                    className="text-lg"
                  />
                  <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      ✨ What gets auto-filled:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Business Name</li>
                      <li>Complete Address</li>
                      <li>Phone Number</li>
                      <li>Website URL</li>
                      <li>Google Maps Link</li>
                    </ul>
                  </div>
                </div>
              </div>

                {/* Website URL / Subdomain Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Website Address (Subdomain)</h2>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-amber-500 mr-3" />
                      <p className="text-sm text-amber-700">
                        <strong>Warning:</strong> Changing your website address will break existing links to your site. Your current customers will need the new URL.
                      </p>
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose Your Unique Subdomain
                    </label>
                    <div className="relative">
                      <div className="flex shadow-sm rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-blue-500 transition-all">
                        <input
                          type="text"
                          value={formData.preferredSlug}
                          onChange={handleSubdomainChange}
                          className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium"
                          placeholder="mybusiness"
                        />
                        <div className="bg-gray-100 px-4 py-3 text-gray-500 font-medium border-l border-gray-200">
                          .varanasihub.com
                        </div>
                      </div>
                      {subdomainStatus?.checking && (
                        <div className="absolute right-40 top-3.5 flex items-center gap-2 text-sm text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking...</span>
                        </div>
                      )}
                    </div>

                    {subdomainStatus?.available === true && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Great! This subdomain is available.</span>
                      </div>
                    )}

                    {subdomainStatus?.available === false && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium text-sm">Sorry, this subdomain is already taken.</span>
                        </div>
                        {subdomainStatus.suggestions?.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">Try one of these available names:</p>
                            <div className="flex flex-wrap gap-2">
                              {subdomainStatus.suggestions.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, preferredSlug: s }));
                                    checkSubdomain(s);
                                  }}
                                  className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-gray-500">
                      Your website will be live at: <span className="text-blue-600 font-medium">https://{formData.preferredSlug || 'your-name'}.varanasihub.com</span>
                    </p>
                  </div>
                </div>

                {/* Theme Selection Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Choose Your Theme <span className="text-sm font-normal text-gray-500">(Can be changed anytime)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Select a theme that best represents your business. You can change this anytime.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Modern Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'modern' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'modern'
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                    >
                      {formData.theme === 'modern' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl mb-3"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
                        <p className="text-sm text-gray-600">
                          Bold gradients, vibrant colors, and contemporary design. Perfect for tech startups and modern businesses.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded"></div>
                        <div className="w-8 h-8 bg-indigo-500 rounded"></div>
                        <div className="w-8 h-8 bg-purple-500 rounded"></div>
                      </div>
                    </div>

                    {/* Classic Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'classic' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'classic'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                    >
                      {formData.theme === 'classic' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-xl mb-3"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Classic</h3>
                        <p className="text-sm text-gray-600">
                          Warm tones, elegant design, and traditional aesthetics. Ideal for restaurants, salons, and service businesses.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-amber-500 rounded"></div>
                        <div className="w-8 h-8 bg-orange-500 rounded"></div>
                        <div className="w-8 h-8 bg-red-500 rounded"></div>
                      </div>
                    </div>

                    {/* Minimal Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'minimal' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'minimal'
                        ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                    >
                      {formData.theme === 'minimal' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-xl mb-3 border-2 border-gray-300"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Minimal</h3>
                        <p className="text-sm text-gray-600">
                          Clean lines, subtle colors, and focus on content. Great for professional services and consultants.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-400 rounded"></div>
                        <div className="w-8 h-8 bg-gray-500 rounded"></div>
                        <div className="w-8 h-8 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter business name"
                      required
                      error={errors.businessName}
                      icon={Building2}
                    />
                    <FormInput
                      label="Owner Name"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Enter owner name (optional)"
                      error={errors.ownerName}
                      icon={User}
                    />
                    <CategorySelect
                      label="Business Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      error={errors.category}
                    />
                    <FormInput
                      label="Mobile Number"
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      required
                      error={errors.mobileNumber}
                      icon={Phone}
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="business@example.com"
                      required
                      error={errors.email}
                      icon={Mail}
                    />
                    <FormInput
                      label="WhatsApp Number"
                      name="whatsappNumber"
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="10-digit WhatsApp number (optional)"
                      error={errors.whatsappNumber}
                      icon={MessageCircle}
                    />
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Location Information</h2>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Auto-Fill Available</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Full Address <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          🔍 Search & Auto-Fill
                        </span>
                      </div>
                      <PlacesAutocomplete
                        value={formData.address}
                        onChange={handleChange}
                        onPlaceSelect={(businessData) => {
                          if (businessData) {
                            // Auto-fill form fields with place data
                            setFormData(prev => ({
                              ...prev,
                              address: businessData.address || prev.address,
                              googleMapLink: businessData.googleMapLink || prev.googleMapLink,
                              // Only auto-fill if field is empty
                              businessName: prev.businessName || businessData.businessName || '',
                              mobileNumber: prev.mobileNumber || formatPhoneNumber(businessData.phoneNumber) || '',
                              website: prev.website || businessData.website || '',
                            }));

                            // Show success message
                            setSuccessMessage({
                              title: '✅ Business Details Extracted!',
                              message: `We've auto-filled your business details from Google. Please review and update as needed.`,
                              temporary: true,
                            });

                            // Clear temporary message after 5 seconds
                            setTimeout(() => {
                              setSuccessMessage(prev =>
                                prev?.temporary ? null : prev
                              );
                            }, 5000);
                          }
                        }}
                        placeholder="Type your business name or address (e.g., 'Restaurant in Varanasi')"
                        error={errors.address}
                      />
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>💡 How to Extract Business Details:</strong>
                        </p>
                        <ol className="text-xs text-blue-700 mt-1 ml-4 list-decimal space-y-1">
                          <li>Start typing your business name or address in the field above</li>
                          <li>Select your business from the dropdown suggestions</li>
                          <li>We'll automatically fill: Business Name, Address, Phone, Website, and Map Link</li>
                        </ol>
                      </div>
                    </div>
                    <FormInput
                      label="Google Map Link"
                      name="googleMapLink"
                      type="url"
                      value={formData.googleMapLink}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/... (auto-filled if address found)"
                      error={errors.googleMapLink}
                      icon={LinkIcon}
                    />
                  </div>
                </div>

                {/* Business Description */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Description</h2>
                  </div>
                  <TextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business in detail (minimum 50 characters)..."
                    required
                    rows={6}
                    error={errors.description}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {formData.description.length >= 50 ? (
                        <span className="text-green-600 font-medium">✓ Minimum length met</span>
                      ) : (
                        <span>{formData.description.length}/50 characters minimum</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* YouTube Video Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Video Content <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <FormInput
                    label="YouTube Video URL"
                    name="youtubeVideo"
                    type="url"
                    value={formData.youtubeVideo}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    error={errors.youtubeVideo}
                    icon={Youtube}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste your YouTube video URL here. It will be embedded on your website.
                  </p>
                </div>

                {/* Media Upload Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Media <span className="text-sm font-normal text-gray-500">(Optional - leave empty to keep existing)</span></h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                      {formData.existingLogo && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                          <img src={formData.existingLogo} alt="Current logo" className="w-24 h-24 object-contain rounded-lg border-2 border-gray-200" />
                        </div>
                      )}
                      <FileUploader
                        name="logo"
                        label={formData.existingLogo ? "Upload New Logo (optional)" : "Upload Logo"}
                        accept="image/*"
                        onChange={(files) => handleFileChange('logo', files?.[0] || null)}
                        maxFiles={1}
                        error={errors.logo}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Images</label>
                      {formData.existingImages && formData.existingImages.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Current Images ({formData.existingImages.length}):</p>
                          <div className="grid grid-cols-4 gap-2">
                            {formData.existingImages.map((img, idx) => (
                              <img key={idx} src={img} alt={`Current ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                            ))}
                          </div>
                        </div>
                      )}
                      <FileUploader
                        name="images"
                        label="Upload New Images (optional - will be added to existing)"
                        accept="image/*"
                        onChange={(files) => handleFileChange('images', files || [])}
                        maxFiles={10}
                        error={errors.images}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Social Links <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput
                      label="Instagram"
                      name="instagram"
                      type="url"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/..."
                      error={errors.instagram}
                      icon={Instagram}
                    />
                    <FormInput
                      label="Facebook"
                      name="facebook"
                      type="url"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                      error={errors.facebook}
                      icon={Facebook}
                    />
                    <FormInput
                      label="Website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      error={errors.website}
                      icon={Globe}
                    />
                  </div>
                </div>

                {/* Navbar & Footer Customization Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Navbar & Footer Customization <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <div className="space-y-6">
                    <FormInput
                      label="Navbar Tagline/Slogan"
                      name="navbarTagline"
                      value={formData.navbarTagline}
                      onChange={handleChange}
                      placeholder="e.g., 'Your Trusted Partner Since 2010' or 'Quality Service, Every Time'"
                      error={errors.navbarTagline}
                      icon={Navigation}
                    />
                    <p className="text-sm text-gray-500 -mt-4">
                      A short tagline that will appear in your website's navbar below the business name
                    </p>

                    <div className="mt-6">
                      <TextArea
                        label="Footer Description"
                        name="footerDescription"
                        value={formData.footerDescription}
                        onChange={handleChange}
                        placeholder="Add a custom description or message for your footer (e.g., 'We are committed to providing the best service to our customers...')"
                        rows={4}
                        error={errors.footerDescription}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        This text will appear in your website's footer section
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services / Menu / Pricing Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Services / Menu / Pricing <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Perfect for Salons, Restaurants, Tuition classes, Pandit ji, Photographers, etc.
                  </p>

                  <div className="space-y-6">
                    {formData.services.map((service, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">Service {index + 1}</h3>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleServiceFeatured(index)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${service.featured
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                              {service.featured ? '⭐ Featured' : 'Mark Featured'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Service Title"
                            value={service.title}
                            onChange={(e) => updateService(index, 'title', e.target.value)}
                            placeholder="e.g., Haircut, Pizza, Math Tuition"
                          />
                          <FormInput
                            label="Price (Optional)"
                            type="text"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', e.target.value)}
                            placeholder="e.g., ₹500 or $20"
                          />
                        </div>
                        <div className="mt-4">
                          <TextArea
                            label="Description"
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                            placeholder="Brief description of the service..."
                            rows={3}
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Image (Optional)
                          </label>
                          {service.imageUrl && !service.image && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                              <img src={service.imageUrl} alt={service.title} className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateService(index, 'image', e.target.files[0])}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          {service.image && (
                            <p className="mt-2 text-sm text-green-600">✓ New image selected</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addService}
                      className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Service
                    </button>
                  </div>
                </div>

                {/* Special Offers / Deals Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Special Offers / Deals <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>

                  <div className="space-y-6">
                    {formData.specialOffers.map((offer, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">Offer {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeSpecialOffer(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Offer Title"
                            value={offer.title}
                            onChange={(e) => updateSpecialOffer(index, 'title', e.target.value)}
                            placeholder="e.g., 50% Off on All Services"
                          />
                          <FormInput
                            label="Expiry Date"
                            type="date"
                            value={offer.expiryDate}
                            onChange={(e) => updateSpecialOffer(index, 'expiryDate', e.target.value)}
                          />
                        </div>
                        <div className="mt-4">
                          <TextArea
                            label="Offer Description"
                            value={offer.description}
                            onChange={(e) => updateSpecialOffer(index, 'description', e.target.value)}
                            placeholder="Describe your special offer..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialOffer}
                      className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Special Offer
                    </button>
                  </div>
                </div>

                {/* Business Hours Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Hours <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Set your business hours. The website will automatically show "Open Now" or "Closed" status.
                  </p>

                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={formData.businessHours[day]?.open || false}
                              onChange={(e) => updateBusinessHours(day, 'open', e.target.checked)}
                              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <label className="text-lg font-semibold text-gray-800 capitalize min-w-[100px]">
                              {day}
                            </label>
                          </div>
                          {formData.businessHours[day]?.open ? (
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="time"
                                value={formData.businessHours[day].start || '09:00'}
                                onChange={(e) => updateBusinessHours(day, 'start', e.target.value)}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <span className="text-gray-600 font-medium">to</span>
                              <input
                                type="time"
                                value={formData.businessHours[day].end || '18:00'}
                                onChange={(e) => updateBusinessHours(day, 'end', e.target.value)}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Closed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appointment / Booking Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Appointment / Booking <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Enable customers to book appointments. The form will automatically send a message via WhatsApp or call.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Preferred Contact Method
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => updateAppointmentSettings('contactMethod', 'whatsapp')}
                          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${formData.appointmentSettings.contactMethod === 'whatsapp'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAppointmentSettings('contactMethod', 'call')}
                          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${formData.appointmentSettings.contactMethod === 'call'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          Call
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Time Slots (Optional)
                      </label>
                      <div className="space-y-3">
                        {formData.appointmentSettings.availableSlots.map((slot, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                              placeholder="Time"
                              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <input
                              type="text"
                              value={slot.label}
                              onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                              placeholder="Label (e.g., Morning, Evening)"
                              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTimeSlot}
                          className="w-full py-2 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 font-semibold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Time Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Map className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Google Maps <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <FormInput
                    label="Google Maps Link"
                    name="googleMapLink"
                    type="url"
                    value={formData.googleMapLink}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/... or Google Maps embed URL"
                    error={errors.googleMapLink}
                    icon={Map}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste your Google Maps link. An interactive map will be embedded on your website's contact section.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                    <div className="relative">
                      <SubmitButton loading={submitting} text="Update Website" />
                    </div>
                  </div>
                </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditWebsite;

