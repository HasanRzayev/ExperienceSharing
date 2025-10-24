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

    // Interaction settings
    const [interactionData, setInteractionData] = useState({
        allowMessages: true,
        allowStoryReplies: true,
        allowTags: true,
        allowMentions: true,
        allowComments: true,
        allowSharing: true,
        restrictedAccounts: [],
        hiddenWords: []
    });

    // Content management
    const [contentData, setContentData] = useState({
        mutedAccounts: [],
        showLikeCounts: true,
        showShareCounts: true,
        contentFilter: 'all',
        autoArchive: false
    });

    // App & Media settings
    const [appData, setAppData] = useState({
        language: 'en',
        theme: 'light',
        autoDownload: false,
        websitePermissions: true,
        accessibilityMode: false
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
        { id: 'security', label: 'Password & Security', icon: '🛡️' },
        { id: 'interaction', label: 'Interaction Settings', icon: '💬' },
        { id: 'content', label: 'Content Management', icon: '📝' },
        { id: 'app', label: 'App & Media', icon: '📱' },
        { id: 'support', label: 'Support & Help', icon: '❓' }
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

    const renderInteractionTab = () => (
        <div className="settings-content">
            <h3>Interaction Settings</h3>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowMessages}
                        onChange={(e) => setInteractionData({...interactionData, allowMessages: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Messages</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowStoryReplies}
                        onChange={(e) => setInteractionData({...interactionData, allowStoryReplies: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Story Replies</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowTags}
                        onChange={(e) => setInteractionData({...interactionData, allowTags: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Tags</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowMentions}
                        onChange={(e) => setInteractionData({...interactionData, allowMentions: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Mentions</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowComments}
                        onChange={(e) => setInteractionData({...interactionData, allowComments: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Comments</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={interactionData.allowSharing}
                        onChange={(e) => setInteractionData({...interactionData, allowSharing: e.target.checked})}
                    />
                    <span className="toggle-text">Allow Sharing</span>
                </label>
            </div>
            <button className="btn-primary" onClick={() => handleSave('interaction')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderContentTab = () => (
        <div className="settings-content">
            <h3>Content Management</h3>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={contentData.showLikeCounts}
                        onChange={(e) => setContentData({...contentData, showLikeCounts: e.target.checked})}
                    />
                    <span className="toggle-text">Show Like Counts</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={contentData.showShareCounts}
                        onChange={(e) => setContentData({...contentData, showShareCounts: e.target.checked})}
                    />
                    <span className="toggle-text">Show Share Counts</span>
                </label>
            </div>
            <div className="form-group">
                <label>Content Filter</label>
                <select
                    value={contentData.contentFilter}
                    onChange={(e) => setContentData({...contentData, contentFilter: e.target.value})}
                >
                    <option value="all">Show All Content</option>
                    <option value="safe">Safe Content Only</option>
                    <option value="family">Family Friendly</option>
                </select>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={contentData.autoArchive}
                        onChange={(e) => setContentData({...contentData, autoArchive: e.target.checked})}
                    />
                    <span className="toggle-text">Auto Archive Old Content</span>
                </label>
            </div>
            <button className="btn-primary" onClick={() => handleSave('content')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderAppTab = () => (
        <div className="settings-content">
            <h3>App & Media Settings</h3>
            <div className="form-group">
                <label>Language</label>
                <select
                    value={appData.language}
                    onChange={(e) => setAppData({...appData, language: e.target.value})}
                >
                    <option value="en">English</option>
                    <option value="az">Azərbaycan</option>
                    <option value="tr">Türkçe</option>
                    <option value="ru">Русский</option>
                </select>
            </div>
            <div className="form-group">
                <label>Theme</label>
                <select
                    value={appData.theme}
                    onChange={(e) => setAppData({...appData, theme: e.target.value})}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                </select>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={appData.autoDownload}
                        onChange={(e) => setAppData({...appData, autoDownload: e.target.checked})}
                    />
                    <span className="toggle-text">Auto Download Media</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={appData.websitePermissions}
                        onChange={(e) => setAppData({...appData, websitePermissions: e.target.checked})}
                    />
                    <span className="toggle-text">Website Permissions</span>
                </label>
            </div>
            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={appData.accessibilityMode}
                        onChange={(e) => setAppData({...appData, accessibilityMode: e.target.checked})}
                    />
                    <span className="toggle-text">Accessibility Mode</span>
                </label>
            </div>
            <button className="btn-primary" onClick={() => handleSave('app')} disabled={loading}>
                Save Changes
            </button>
        </div>
    );

    const renderSupportTab = () => (
        <div className="settings-content">
            <h3>Support & Help</h3>
            <div className="help-section">
                <h4>Account Status</h4>
                <p>Your account is active and in good standing.</p>
            </div>
            <div className="help-section">
                <h4>Privacy Center</h4>
                <p>Learn more about how we protect your privacy and data.</p>
            </div>
            <div className="help-section">
                <h4>Help Center</h4>
                <p>Find answers to common questions and get support.</p>
            </div>
            <div className="help-section">
                <h4>Contact Support</h4>
                <p>Need help? Contact our support team.</p>
            </div>
            <div className="help-links">
                <a href="/help" className="help-link">Help Center</a>
                <a href="/privacy" className="help-link">Privacy Policy</a>
                <a href="/contact" className="help-link">Contact Us</a>
                <a href="/report" className="help-link">Report Issue</a>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return renderProfileTab();
            case 'privacy': return renderPrivacyTab();
            case 'notifications': return renderNotificationsTab();
            case 'account': return renderAccountTab();
            case 'security': return renderSecurityTab();
            case 'interaction': return renderInteractionTab();
            case 'content': return renderContentTab();
            case 'app': return renderAppTab();
            case 'support': return renderSupportTab();
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