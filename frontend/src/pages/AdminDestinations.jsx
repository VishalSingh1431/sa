import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Loader2, X, Save, Image as ImageIcon, Search } from 'lucide-react';
import { destinationsAPI, uploadAPI } from '../config/api';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../config/api';

const AdminDestinations = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    imagePublicId: '',
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
        fetchDestinations();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Please login to continue');
      navigate('/login');
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationsAPI.getAllDestinationsAdmin();
      setDestinations(response.destinations || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error(error.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const result = await uploadAPI.uploadImage(file);
      
      setFormData(prev => ({
        ...prev,
        image: result.url,
        imagePublicId: result.public_id
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDestination) {
        await destinationsAPI.updateDestination(editingDestination.id, formData);
        toast.success('Destination updated successfully!');
      } else {
        await destinationsAPI.createDestination(formData);
        toast.success('Destination created successfully!');
      }

      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast.error(error.message || 'Failed to save destination');
    }
  };

  const handleEdit = (destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name || '',
      image: destination.image || '',
      imagePublicId: destination.imagePublicId || '',
      status: destination.status || 'active',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    try {
      await destinationsAPI.deleteDestination(id);
      toast.success('Destination deleted successfully!');
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error(error.message || 'Failed to delete destination');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      imagePublicId: '',
      status: 'active',
    });
    setEditingDestination(null);
    setShowForm(false);
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Manage Destinations
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Create, edit, and manage destinations</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Add New Destination</span>
          </button>
        </div>

        {!showForm && (
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
              />
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto pt-20 sm:pt-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingDestination ? 'Edit Destination' : 'Create New Destination'}
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Upload Image
                    </label>
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg" />
                    )}
                  </div>
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

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {editingDestination ? 'Update Destination' : 'Create Destination'}
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

        {!showForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="block sm:hidden">
              {filteredDestinations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No destinations found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredDestinations.map((dest) => (
                    <div key={dest.id} className="p-4 hover:bg-gray-50">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {dest.image ? (
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-2">{dest.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(dest)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dest.id)}
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

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDestinations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No destinations found
                      </td>
                    </tr>
                  ) : (
                    filteredDestinations.map((dest) => (
                      <tr key={dest.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {dest.image ? (
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">{dest.name}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            dest.status === 'active' ? 'bg-green-100 text-green-800' :
                            dest.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dest.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(dest)}
                              className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dest.id)}
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

export default AdminDestinations;
