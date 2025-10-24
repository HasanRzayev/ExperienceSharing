import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Settings.css';
import { SettingsIcons } from '../components/SettingsIcons';

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

    // Close Friends
    const [closeFriends, setCloseFriends] = useState([]);
    const [newCloseFriend, setNewCloseFriend] = useState('');

    // Blocked Accounts
    const [blockedAccounts, setBlockedAccounts] = useState([]);
    const [newBlockedUser, setNewBlockedUser] = useState('');

    // Muted Accounts
    const [mutedAccounts, setMutedAccounts] = useState([]);
    const [newMutedUser, setNewMutedUser] = useState('');

    // Hidden Words
    const [hiddenWords, setHiddenWords] = useState([]);
    const [newHiddenWord, setNewHiddenWord] = useState('');

    // Account Tools
    const [accountTools, setAccountTools] = useState({
        accountType: 'personal', // personal, business, creator
        analyticsEnabled: false,
        insightsEnabled: false,
        professionalTools: false
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
            
            // Load all settings from SettingsController
            const [profileRes, privacyRes, notificationRes, accountRes, interactionRes, contentRes, appRes, toolsRes] = await Promise.all([
                axios.get(`${apiBaseUrl}/Settings/profile`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/privacy`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/notifications`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/account`, { headers }),
                axios.get(`${apiBaseUrl}/Settings/interaction`, { headers }).catch(() => ({ data: {} })),
                axios.get(`${apiBaseUrl}/Settings/content`, { headers }).catch(() => ({ data: {} })),
                axios.get(`${apiBaseUrl}/Settings/app`, { headers }).catch(() => ({ data: {} })),
                axios.get(`${apiBaseUrl}/Settings/tools`, { headers }).catch(() => ({ data: {} }))
            ]);

            // Set profile data
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

            // Set privacy data
            setPrivacyData({
                isPrivate: privacyRes.data.isPrivate || false,
                allowComments: privacyRes.data.allowComments || true,
                allowTags: privacyRes.data.allowTags || true,
                allowMentions: privacyRes.data.allowMentions || true,
                showActivityStatus: privacyRes.data.showActivityStatus || true
            });

            // Set notification data
            setNotificationData({
                emailNotifications: notificationRes.data.emailNotifications || true,
                pushNotifications: notificationRes.data.pushNotifications || true
            });

            // Set account data
            setAccountData({
                userName: accountRes.data.userName || '',
                email: accountRes.data.email || '',
                language: accountRes.data.language || 'en'
            });

            // Set interaction data
            setInteractionData({
                allowMessages: interactionRes.data.allowMessages ?? true,
                allowStoryReplies: interactionRes.data.allowStoryReplies ?? true,
                allowTags: interactionRes.data.allowTags ?? true,
                allowMentions: interactionRes.data.allowMentions ?? true,
                allowComments: interactionRes.data.allowComments ?? true,
                allowSharing: interactionRes.data.allowSharing ?? true,
                restrictedAccounts: interactionRes.data.restrictedAccounts || [],
                hiddenWords: interactionRes.data.hiddenWords || []
            });

            // Set content data
            setContentData({
                showLikeCounts: contentRes.data.showLikeCounts ?? true,
                showShareCounts: contentRes.data.showShareCounts ?? true,
                contentFilter: contentRes.data.contentFilter || 'all',
                autoArchive: contentRes.data.autoArchive ?? false,
                mutedAccounts: contentRes.data.mutedAccounts || []
            });

            // Set app data
            setAppData({
                language: appRes.data.language || 'en',
                theme: appRes.data.theme || 'light',
                autoDownload: appRes.data.autoDownload ?? false,
                websitePermissions: appRes.data.websitePermissions ?? true,
                accessibilityMode: appRes.data.accessibilityMode ?? false
            });

            // Set account tools data
            setAccountTools({
                accountType: toolsRes.data.accountType || 'personal',
                analyticsEnabled: toolsRes.data.analyticsEnabled ?? false,
                insightsEnabled: toolsRes.data.insightsEnabled ?? false,
                professionalTools: toolsRes.data.professionalTools ?? false
            });
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
                    setMessage('Profile settings saved successfully');
                    break;
                case 'privacy':
                    await axios.put(`${apiBaseUrl}/Settings/privacy`, privacyData, { headers });
                    setMessage('Privacy settings saved successfully');
                    break;
                case 'notifications':
                    await axios.put(`${apiBaseUrl}/Settings/notifications`, notificationData, { headers });
                    setMessage('Notification settings saved successfully');
                    break;
                case 'account':
                    await axios.put(`${apiBaseUrl}/Settings/account`, accountData, { headers });
                    setMessage('Account settings saved successfully');
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
                case 'interaction':
                    await axios.put(`${apiBaseUrl}/Settings/interaction`, interactionData, { headers });
                    setMessage('Interaction settings saved successfully');
                    break;
                case 'content':
                    await axios.put(`${apiBaseUrl}/Settings/content`, contentData, { headers });
                    setMessage('Content settings saved successfully');
                    break;
                case 'app':
                    await axios.put(`${apiBaseUrl}/Settings/app`, appData, { headers });
                    setMessage('App settings saved successfully');
                    break;
                case 'tools':
                    await axios.put(`${apiBaseUrl}/Settings/tools`, accountTools, { headers });
                    setMessage('Account tools saved successfully');
                    break;
                default:
                    setMessage('Settings saved successfully');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const settingsTabs = [
        { id: 'profile', label: 'Personal Details', icon: SettingsIcons.profile },
        { id: 'privacy', label: 'Account Privacy', icon: SettingsIcons.privacy },
        { id: 'notifications', label: 'Notifications', icon: SettingsIcons.notifications },
        { id: 'account', label: 'Account Settings', icon: SettingsIcons.account },
        { id: 'security', label: 'Password & Security', icon: SettingsIcons.security },
        { id: 'interaction', label: 'Interaction Settings', icon: SettingsIcons.interaction },
        { id: 'content', label: 'Content Management', icon: SettingsIcons.content },
        { id: 'app', label: 'App & Media', icon: SettingsIcons.app },
        { id: 'closeFriends', label: 'Close Friends', icon: SettingsIcons.closeFriends },
        { id: 'blocked', label: 'Blocked Accounts', icon: SettingsIcons.blocked },
        { id: 'muted', label: 'Muted Accounts', icon: SettingsIcons.muted },
        { id: 'tools', label: 'Account Tools', icon: SettingsIcons.tools },
        { id: 'support', label: 'Support & Help', icon: SettingsIcons.support }
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

    const renderCloseFriendsTab = () => (
        <div className="settings-content">
            <h3>Close Friends</h3>
            <p className="section-description">Manage your close friends list. Only close friends can see your private experiences.</p>
            
            <div className="form-group">
                <label>Add Close Friend</label>
                <div className="input-group">
                    <input
                        type="text"
                        value={newCloseFriend}
                        onChange={(e) => setNewCloseFriend(e.target.value)}
                        placeholder="Enter username or email"
                    />
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            if (newCloseFriend.trim()) {
                                setCloseFriends([...closeFriends, newCloseFriend.trim()]);
                                setNewCloseFriend('');
                            }
                        }}
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="list-section">
                <h4>Close Friends ({closeFriends.length})</h4>
                {closeFriends.length === 0 ? (
                    <p className="empty-state">No close friends added yet.</p>
                ) : (
                    <div className="list-items">
                        {closeFriends.map((friend, index) => (
                            <div key={index} className="list-item">
                                <span>{friend}</span>
                                <button 
                                    className="btn-remove"
                                    onClick={() => setCloseFriends(closeFriends.filter((_, i) => i !== index))}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderBlockedTab = () => (
        <div className="settings-content">
            <h3>Blocked Accounts</h3>
            <p className="section-description">Manage blocked users. Blocked users cannot see your content or interact with you.</p>
            
            <div className="form-group">
                <label>Block User</label>
                <div className="input-group">
                    <input
                        type="text"
                        value={newBlockedUser}
                        onChange={(e) => setNewBlockedUser(e.target.value)}
                        placeholder="Enter username or email"
                    />
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            if (newBlockedUser.trim()) {
                                setBlockedAccounts([...blockedAccounts, newBlockedUser.trim()]);
                                setNewBlockedUser('');
                            }
                        }}
                    >
                        Block
                    </button>
                </div>
            </div>

            <div className="list-section">
                <h4>Blocked Users ({blockedAccounts.length})</h4>
                {blockedAccounts.length === 0 ? (
                    <p className="empty-state">No blocked users.</p>
                ) : (
                    <div className="list-items">
                        {blockedAccounts.map((user, index) => (
                            <div key={index} className="list-item">
                                <span>{user}</span>
                                <button 
                                    className="btn-unblock"
                                    onClick={() => setBlockedAccounts(blockedAccounts.filter((_, i) => i !== index))}
                                >
                                    Unblock
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderMutedTab = () => (
        <div className="settings-content">
            <h3>Muted Accounts</h3>
            <p className="section-description">Muted users' content won't appear in your feed, but they can still see your content.</p>
            
            <div className="form-group">
                <label>Mute User</label>
                <div className="input-group">
                    <input
                        type="text"
                        value={newMutedUser}
                        onChange={(e) => setNewMutedUser(e.target.value)}
                        placeholder="Enter username or email"
                    />
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            if (newMutedUser.trim()) {
                                setMutedAccounts([...mutedAccounts, newMutedUser.trim()]);
                                setNewMutedUser('');
                            }
                        }}
                    >
                        Mute
                    </button>
                </div>
            </div>

            <div className="list-section">
                <h4>Muted Users ({mutedAccounts.length})</h4>
                {mutedAccounts.length === 0 ? (
                    <p className="empty-state">No muted users.</p>
                ) : (
                    <div className="list-items">
                        {mutedAccounts.map((user, index) => (
                            <div key={index} className="list-item">
                                <span>{user}</span>
                                <button 
                                    className="btn-unmute"
                                    onClick={() => setMutedAccounts(mutedAccounts.filter((_, i) => i !== index))}
                                >
                                    Unmute
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderToolsTab = () => (
        <div className="settings-content">
            <h3>Account Tools</h3>
            <p className="section-description">Professional tools and account type settings.</p>
            
            <div className="form-group">
                <label>Account Type</label>
                <select
                    value={accountTools.accountType}
                    onChange={(e) => setAccountTools({...accountTools, accountType: e.target.value})}
                >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="creator">Creator</option>
                </select>
            </div>

            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={accountTools.analyticsEnabled}
                        onChange={(e) => setAccountTools({...accountTools, analyticsEnabled: e.target.checked})}
                    />
                    <span className="toggle-text">Enable Analytics</span>
                </label>
                <p className="help-text">View detailed analytics about your experiences</p>
            </div>

            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={accountTools.insightsEnabled}
                        onChange={(e) => setAccountTools({...accountTools, insightsEnabled: e.target.checked})}
                    />
                    <span className="toggle-text">Enable Insights</span>
                </label>
                <p className="help-text">Get insights about your audience and engagement</p>
            </div>

            <div className="toggle-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={accountTools.professionalTools}
                        onChange={(e) => setAccountTools({...accountTools, professionalTools: e.target.checked})}
                    />
                    <span className="toggle-text">Professional Tools</span>
                </label>
                <p className="help-text">Access advanced features for content creators</p>
            </div>

            <button className="btn-primary" onClick={() => handleSave('tools')} disabled={loading}>
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
            case 'closeFriends': return renderCloseFriendsTab();
            case 'blocked': return renderBlockedTab();
            case 'muted': return renderMutedTab();
            case 'tools': return renderToolsTab();
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