import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Loader2, X, Save, Upload, Image as ImageIcon, Video, Search } from 'lucide-react';
import { tripsAPI, uploadAPI } from '../config/api';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../config/api';

const AdminTrips = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState({ image: false, video: false, gallery: false });

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    duration: '',
    price: '',
    oldPrice: '',
    imageUrl: '',
    videoUrl: '',
    subtitle: '',
    intro: '',
    whyVisit: [''],
    itinerary: [{ day: 'Day 1', title: '', activities: '' }],
    included: [''],
    notIncluded: [''],
    notes: [''],
    faq: [{ question: '', answer: '' }],
    reviews: [{ rating: 5, text: '', author: '' }],
    gallery: [],
    status: 'active',
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
        if (response.user.role !== 'admin' && response.user.role !== 'main_admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
        fetchTrips();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Please login to continue');
      navigate('/login');
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAllTripsAdmin();
      setTrips(response.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error(error.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      
      let result;
      if (type === 'image' || type === 'gallery') {
        result = await uploadAPI.uploadImage(file);
      } else if (type === 'video') {
        result = await uploadAPI.uploadVideo(file);
      }

      if (type === 'image') {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.url,
          imagePublicId: result.public_id
        }));
        toast.success('Image uploaded successfully!');
      } else if (type === 'video') {
        setFormData(prev => ({
          ...prev,
          videoUrl: result.url,
          videoPublicId: result.public_id
        }));
        toast.success('Video uploaded successfully!');
      } else if (type === 'gallery') {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, result.url],
          galleryPublicIds: [...(prev.galleryPublicIds || []), result.public_id]
        }));
        toast.success('Gallery image uploaded!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tripData = {
        ...formData,
        whyVisit: formData.whyVisit.filter(v => v.trim()),
        included: formData.included.filter(v => v.trim()),
        notIncluded: formData.notIncluded.filter(v => v.trim()),
        notes: formData.notes.filter(v => v.trim()),
        itinerary: formData.itinerary.filter(i => i.title.trim() || i.activities.trim()),
        faq: formData.faq.filter(f => f.question.trim() || f.answer.trim()),
        reviews: formData.reviews.filter(r => r.text.trim()),
      };

      if (editingTrip) {
        await tripsAPI.updateTrip(editingTrip.id, tripData);
        toast.success('Trip updated successfully!');
      } else {
        await tripsAPI.createTrip(tripData);
        toast.success('Trip created successfully!');
      }

      resetForm();
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error(error.message || 'Failed to save trip');
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title || '',
      location: trip.location || '',
      duration: trip.duration || '',
      price: trip.price || '',
      oldPrice: trip.oldPrice || '',
      imageUrl: trip.imageUrl || trip.image || '',
      videoUrl: trip.videoUrl || trip.video || '',
      subtitle: trip.subtitle || '',
      intro: trip.intro || '',
      whyVisit: trip.whyVisit && trip.whyVisit.length > 0 ? trip.whyVisit : [''],
      itinerary: trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [{ day: 'Day 1', title: '', activities: '' }],
      included: trip.included && trip.included.length > 0 ? trip.included : [''],
      notIncluded: trip.notIncluded && trip.notIncluded.length > 0 ? trip.notIncluded : [''],
      notes: trip.notes && trip.notes.length > 0 ? trip.notes : [''],
      faq: trip.faq && trip.faq.length > 0 ? trip.faq : [{ question: '', answer: '' }],
      reviews: trip.reviews && trip.reviews.length > 0 ? trip.reviews : [{ rating: 5, text: '', author: '' }],
      gallery: trip.gallery || [],
      galleryPublicIds: trip.galleryPublicIds || [],
      imagePublicId: trip.imagePublicId,
      videoPublicId: trip.videoPublicId,
      status: trip.status || 'active',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      await tripsAPI.deleteTrip(id);
      toast.success('Trip deleted successfully!');
      fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error(error.message || 'Failed to delete trip');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      duration: '',
      price: '',
      oldPrice: '',
      imageUrl: '',
      videoUrl: '',
      subtitle: '',
      intro: '',
      whyVisit: [''],
      itinerary: [{ day: 'Day 1', title: '', activities: '' }],
      included: [''],
      notIncluded: [''],
      notes: [''],
      faq: [{ question: '', answer: '' }],
      reviews: [{ rating: 5, text: '', author: '' }],
      gallery: [],
      status: 'active',
    });
    setEditingTrip(null);
    setShowForm(false);
  };

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Manage Trips
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Create, edit, and manage trip packages</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Add New Trip</span>
          </button>
        </div>

        {/* Search */}
        {!showForm && (
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search trips by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto pt-20 sm:pt-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingTrip ? 'Edit Trip' : 'Create New Trip'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 6 days"
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., ₹22,999"
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Old Price</label>
                    <input
                      type="text"
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleInputChange}
                      placeholder="e.g., ₹24,999"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Main Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'image')}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                    >
                      {uploading.image ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Upload Image
                    </label>
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg" />
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'video')}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {uploading.video ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                      Upload Video
                    </label>
                    {formData.videoUrl && (
                      <span className="text-sm text-gray-600">Video uploaded ✓</span>
                    )}
                  </div>
                </div>

                {/* Subtitle & Intro */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Introduction</label>
                  <textarea
                    name="intro"
                    value={formData.intro}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Why Visit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Why Visit (Reasons)</label>
                  {formData.whyVisit.map((reason, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => handleArrayChange('whyVisit', index, e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('whyVisit', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('whyVisit')}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + Add Reason
                  </button>
                </div>

                {/* Itinerary */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Itinerary</label>
                  {formData.itinerary.map((day, index) => (
                    <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={day.day}
                          onChange={(e) => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[index].day = e.target.value;
                            setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                          }}
                          placeholder="Day 1"
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[index].title = e.target.value;
                            setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                          }}
                          placeholder="Title"
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('itinerary', index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={day.activities}
                        onChange={(e) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[index].activities = e.target.value;
                          setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                        }}
                        placeholder="Activities description"
                        rows={2}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('itinerary', { day: `Day ${formData.itinerary.length + 1}`, title: '', activities: '' })}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + Add Day
                  </button>
                </div>

                {/* Included & Not Included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">What's Included</label>
                    {formData.included.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange('included', index, e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('included', index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('included')}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">What's Not Included</label>
                    {formData.notIncluded.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange('notIncluded', index, e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('notIncluded', index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('notIncluded')}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Important Notes</label>
                  {formData.notes.map((note, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleArrayChange('notes', index, e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('notes', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('notes')}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + Add Note
                  </button>
                </div>

                {/* FAQ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">FAQ</label>
                  {formData.faq.map((faq, index) => (
                    <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">Question {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('faq', index)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaq = [...formData.faq];
                          newFaq[index].question = e.target.value;
                          setFormData(prev => ({ ...prev, faq: newFaq }));
                        }}
                        placeholder="Question"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaq = [...formData.faq];
                          newFaq[index].answer = e.target.value;
                          setFormData(prev => ({ ...prev, faq: newFaq }));
                        }}
                        placeholder="Answer"
                        rows={2}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('faq', { question: '', answer: '' })}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + Add FAQ
                  </button>
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images</label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {formData.gallery.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Gallery ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = formData.gallery.filter((_, i) => i !== index);
                            const newPublicIds = (formData.galleryPublicIds || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, gallery: newGallery, galleryPublicIds: newPublicIds }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'gallery')}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    {uploading.gallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    Add Gallery Image
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {editingTrip ? 'Update Trip' : 'Create Trip'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Trips List */}
        {!showForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {filteredTrips.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No trips found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <div key={trip.id} className="p-4 hover:bg-gray-50">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {trip.imageUrl || trip.image ? (
                            <img
                              src={trip.imageUrl || trip.image}
                              alt={trip.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">{trip.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{trip.location}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">{trip.duration}</span>
                            <span className="text-sm font-semibold text-gray-900">{trip.price}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              trip.status === 'active' ? 'bg-green-100 text-green-800' :
                              trip.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trip.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/trip/${trip.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(trip)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trip.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Duration</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No trips found
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {trip.imageUrl || trip.image ? (
                            <img
                              src={trip.imageUrl || trip.image}
                              alt={trip.title}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">{trip.title}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700 text-sm sm:text-base">{trip.location}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700 text-sm sm:text-base">{trip.duration}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700 font-semibold text-sm sm:text-base">{trip.price}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            trip.status === 'active' ? 'bg-green-100 text-green-800' :
                            trip.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => navigate(`/trip/${trip.id}`)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(trip)}
                              className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trip.id)}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrips;
