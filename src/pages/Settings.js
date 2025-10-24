import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Profile data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        website: '',
        phoneNumber: '',
        birthDate: '',
        gender: '',
        country: ''
    });

    // Privacy settings
    const [privacyData, setPrivacyData] = useState({
        isPrivate: false,
        allowComments: true,
        allowTags: true,
        allowMentions: true,
        showActivityStatus: true
    });

    // Notification settings
    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        pushNotifications: true
    });

    // Account settings
    const [accountData, setAccountData] = useState({
        userName: '',
        email: '',
        language: 'en'
    });

    // Password change
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            
            // Load all settings
            const [profileRes, privacyRes, notificationRes, accountRes] = await Promise.all([
                axios.get(`${apiBaseUrl}/Settings/profile`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/privacy`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/notifications`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/account`, { headers })
            ]);

            setProfileData({
                firstName: profileRes.data.firstName || '',
                lastName: profileRes.data.lastName || '',
                bio: profileRes.data.bio || '',
                website: profileRes.data.website || '',
                phoneNumber: profileRes.data.phoneNumber || '',
                birthDate: profileRes.data.birthDate ? profileRes.data.birthDate.split('T')[0] : '',
                gender: profileRes.data.gender || '',
                country: profileRes.data.country || ''
            });

            setPrivacyData(privacyRes.data);
            setNotificationData(notificationRes.data);
            setAccountData(accountRes.data);
        } catch (error) {
            console.error('Error loading settings:', error);
            setMessage('Error loading settings');
        }
    };

    const handleSave = async (type) => {
        setLoading(true);
        setMessage('');

        try {
            const token = Cookies.get('token');
            const headers = { Authorization: `Bearer ${token}` };

            switch (type) {
                case 'profile':
                    await axios.put(`${apiBaseUrl}/Settings/profile`, profileData, { headers });
                    setMessage('Profile updated successfully');
                    break;
                case 'privacy':
                    await axios.put(`${apiBaseUrl}/Settings/privacy`, privacyData, { headers });
                    setMessage('Privacy settings updated successfully');
                    break;
                case 'notifications':
                    await axios.put(`${apiBaseUrl}/Settings/notifications`, notificationData, { headers });
                    setMessage('Notification settings updated successfully');
                    break;
                case 'account':
                    await axios.put(`${apiBaseUrl}/Settings/account`, accountData, { headers });
                    setMessage('Account settings updated successfully');
                    break;
                case 'password':
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                        setMessage('New passwords do not match');
                        setLoading(false);
                        return;
                    }
                    await axios.put(`${apiBaseUrl}/Settings/password`, {
                        oldPassword: passwordData.oldPassword,
                        newPassword: passwordData.newPassword
                    }, { headers });
                    setMessage('Password changed successfully');
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    break;
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const settingsTabs = [
        { id: 'profile', label: 'Personal Details', icon: '👤' },
        { id: 'privacy', label: 'Account Privacy', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'account', label: 'Account Settings', icon: '⚙️' },
        { id: 'security', label: 'Password & Security', icon: '🛡️' }
    ];

    const renderProfileTab = () => (
        <div className="settings-content">
            <h3>Personal Details</h3>
            <div className="form-group">
                <label>First Name</label>
                <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>Last Name</label>
                <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>Bio</label>
                <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows="3"
                    placeholder="Tell us about yourself..."
                />
            </div>
            <div className="form-group">
                <label>Website</label>
                <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    placeholder="https://example.com"
                />
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Birth Date</label>
                    <input
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label>Country</label>
                <input
                    type="text"
                    value={profileData.country}
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                />
            </div>
            <button className="btn-primary" onClick={() => handleSave('profile')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderPrivacyTab = () => (
        <div className="settings-content">
            <h3>Account Privacy</h3>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={privacyData.isPrivate}
                        onChange={(e) => setPrivacyData({...privacyData, isPrivate: e.target.checked})}
                    />
                    <span className="toggle-text">Private Account</span>
                </label>
                <p className="help-text">Only approved followers can see your experiences</p>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={privacyData.allowComments}
                        onChange={(e) => setPrivacyData({...privacyData, allowComments: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Comments</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={privacyData.allowTags}
                        onChange={(e) => setPrivacyData({...privacyData, allowTags: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Tags</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={privacyData.allowMentions}
                        onChange={(e) => setPrivacyData({...privacyData, allowMentions: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Mentions</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={privacyData.showActivityStatus}
                        onChange={(e) => setPrivacyData({...privacyData, showActivityStatus: e.target.checked})}
                    />
                    <span className="toggle-text">Show Activity Status</span>
                </label>
            </div>
            <button className="btn-primary" onClick={() => handleSave('privacy')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="settings-content">
            <h3>Notifications</h3>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={notificationData.emailNotifications}
                        onChange={(e) => setNotificationData({...notificationData, emailNotifications: e.target.checked})}
                    />
                    <span className="toggle-text">Email Notifications</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={notificationData.pushNotifications}
                        onChange={(e) => setNotificationData({...notificationData, pushNotifications: e.target.checked})}
                    />
                    <span className="toggle-text">Push Notifications</span>
                </label>
            </div>
            <button className="btn-primary" onClick={() => handleSave('notifications')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderAccountTab = () => (
        <div className="settings-content">
            <h3>Account Settings</h3>
            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    value={accountData.userName}
                    onChange={(e) => setAccountData({...accountData, userName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>Language</label>
                <select
                    value={accountData.language}
                    onChange={(e) => setAccountData({...accountData, language: e.target.value})}
                >
                    <option value="en">English</option>
                    <option value="az">Azərbaycan</option>
                    <option value="tr">Türkçe</option>
                    <option value="ru">Русский</option>
                </select>
            </div>
            <button className="btn-primary" onClick={() => handleSave('account')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="settings-content">
            <h3>Password & Security</h3>
            <div className="form-group">
                <label>Current Password</label>
                <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>New Password</label>
                <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>Confirm New Password</label>
                <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
            </div>
            <button className="btn-primary" onClick={() => handleSave('password')} disabled={loading}>
                Change Password
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return renderProfileTab();
            case 'privacy': return renderPrivacyTab();
            case 'notifications': return renderNotificationsTab();
            case 'account': return renderAccountTab();
            case 'security': return renderSecurityTab();
            default: return renderProfileTab();
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>

                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="settings-layout">
                    <div className="settings-sidebar">
                        {settingsTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="settings-main">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;