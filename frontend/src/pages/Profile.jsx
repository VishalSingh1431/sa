import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, X, Loader2, LogOut, Search, Shield, ShieldCheck, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { authAPI } from '../config/api';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
        setFormData({
          name: response.user.name || '',
          phone: response.user.phone || '',
          bio: response.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Failed to load profile');
      if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const response = await authAPI.updateProfile({
        name: formData.name.trim() || null,
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
      });

      if (response.user) {
        setUser(response.user);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('authChange'));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await authAPI.getAllUsers(searchTerm);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await authAPI.promoteUser(userId);
      toast.success('User promoted to admin successfully!');
      fetchUsers();
      // Refresh current user data
      fetchUserProfile();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await authAPI.demoteUser(userId);
      toast.success('User demoted successfully!');
      fetchUsers();
      // Refresh current user data
      fetchUserProfile();
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error(error.message || 'Failed to demote user');
    }
  };

  useEffect(() => {
    if (showUserManagement && user?.role === 'main_admin') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserManagement, searchTerm, user?.role]);

  const getRoleBadge = (role) => {
    if (role === 'main_admin') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Main Admin</span>;
    } else if (role === 'admin') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Admin</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">User</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || user.email}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.name || 'User'}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90 mb-4">
                  <Mail className="w-5 h-5" />
                  <span>{user.email}</span>
                </div>
                {user.role && (
                  <span className={`inline-block px-3 py-1 backdrop-blur-sm text-white rounded-full text-sm font-semibold ${
                    user.role === 'main_admin' 
                      ? 'bg-red-500/30 border border-red-300/50' 
                      : user.role === 'admin'
                      ? 'bg-yellow-500/30 border border-yellow-300/50'
                      : 'bg-white/20'
                  }`}>
                    {user.role === 'main_admin' 
                      ? 'Main Administrator' 
                      : user.role === 'admin'
                      ? 'Administrator'
                      : 'User'}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {user.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{user.phone || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.bio && (
                        <p className="text-sm text-red-600">{errors.bio}</p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                    {user.bio || 'No bio added yet'}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900 font-medium">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Management Section (Main Admin Only) */}
              {user.role === 'main_admin' && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </h3>
                    <button
                      onClick={() => {
                        setShowUserManagement(!showUserManagement);
                        if (!showUserManagement) {
                          fetchUsers();
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                    >
                      {showUserManagement ? 'Hide' : 'Show'} Users
                    </button>
                  </div>

                  {showUserManagement && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search users by email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                fetchUsers();
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Users List */}
                      {loadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                      ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No users found
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {users.map((u) => (
                            <div
                              key={u.id}
                              className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div>
                                    {u.picture ? (
                                      <img
                                        src={u.picture}
                                        alt={u.name || u.email}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {u.name || 'No name'}
                                    </p>
                                    <p className="text-sm text-gray-600">{u.email}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {getRoleBadge(u.role)}
                                {u.role === 'user' && (
                                  <button
                                    onClick={() => handlePromoteUser(u.id)}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-all duration-300 flex items-center gap-2"
                                    title="Promote to Admin"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                    Promote
                                  </button>
                                )}
                                {u.role === 'admin' && (
                                  <button
                                    onClick={() => handleDemoteUser(u.id)}
                                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition-all duration-300 flex items-center gap-2"
                                    title="Demote to User"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                    Demote
                                  </button>
                                )}
                                {u.role === 'main_admin' && (
                                  <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                                    Cannot modify
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

