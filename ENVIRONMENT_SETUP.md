# Environment Configuration

## Overview
This project has been updated to use environment variables instead of hardcoded URLs for better configuration management and deployment flexibility.

## Environment Variables

The following environment variables are defined in `.env`:

### Backend API Configuration
- `REACT_APP_API_BASE_URL`: Base URL for all API endpoints (default: `http://localhost:5029/api`)
- `REACT_APP_BACKEND_URL`: Backend server URL (default: `http://localhost:5029`)

### External Services
- `REACT_APP_CLOUDINARY_ENDPOINT`: Cloudinary API endpoint for image uploads
- `REACT_APP_GIPHY_API_URL`: Giphy API URL for GIF functionality
- `REACT_APP_SIGNALR_HUB_URL`: SignalR hub URL for real-time messaging

## Files Updated

The following files have been updated to use environment variables:

### Services
- `src/services/AuthService.js` - Updated API_URL to use environment variable

### Pages
- `src/pages/Home.js` - Updated experience fetching URLs
- `src/pages/ChatPage.js` - Updated all API calls and external service URLs
- `src/pages/UserProfilePage.js` - Updated user profile API calls
- `src/pages/CardAbout.js` - Updated experience detail API calls
- `src/pages/Notification.js` - Updated follow request API calls
- `src/pages/Setting.js` - Updated profile and image upload API calls
- `src/pages/NewExperience.js` - Updated experience creation API calls
- `src/pages/Profil.js` - Updated profile and follow data API calls
- `src/pages/Following.js` - Updated following list API calls
- `src/pages/Follow.js` - Updated followers list API calls

### Components
- `src/components/Navbar.js` - Updated user profile API calls
- `src/components/LikeButton.js` - Updated like/unlike API calls
- `src/components/FollowButton.js` - Updated follow/unfollow API calls

## Usage

### Development
For development, the default values in `.env` will work with a local backend running on port 5029.

### Production
For production deployment, update the environment variables in your deployment platform:

```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
REACT_APP_BACKEND_URL=https://your-api-domain.com
REACT_APP_CLOUDINARY_ENDPOINT=https://api.cloudinary.com/v1_1/your-cloud-name/
REACT_APP_GIPHY_API_URL=https://api.giphy.com/v1/gifs
REACT_APP_SIGNALR_HUB_URL=https://your-api-domain.com/api/hubs/message
```

### Docker
For Docker deployments, you can override these values using environment variables or a `.env.production` file.

## Benefits

1. **Flexibility**: Easy to switch between development, staging, and production environments
2. **Security**: No hardcoded URLs in source code
3. **Maintainability**: Centralized configuration management
4. **Deployment**: Easy to configure for different deployment platforms
5. **Team Collaboration**: Each developer can have their own local configuration

## Migration Notes

- All hardcoded `localhost:5029` URLs have been replaced with environment variables
- External service URLs (Cloudinary, Giphy) are now configurable
- The application will automatically use the environment variables when available
- Fallback to default values if environment variables are not set



