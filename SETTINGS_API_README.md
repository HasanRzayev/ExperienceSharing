# Experience Sharing Backend - Settings API Update

## Overview
This update adds comprehensive Settings API endpoints to the Experience Sharing backend, allowing users to manage their profile, privacy, notifications, and other account settings.

## New Features Added

### 1. Settings API Endpoints
- **Profile Settings**: `/api/Settings/profile` (GET/PUT)
- **Privacy Settings**: `/api/Settings/privacy` (GET/PUT)
- **Notification Settings**: `/api/Settings/notifications` (GET/PUT)
- **Account Settings**: `/api/Settings/account` (GET/PUT)
- **Password Change**: `/api/Settings/password` (PUT)
- **Interaction Settings**: `/api/Settings/interaction` (GET/PUT)
- **Content Settings**: `/api/Settings/content` (GET/PUT)
- **App Settings**: `/api/Settings/app` (GET/PUT)
- **Account Tools**: `/api/Settings/tools` (GET/PUT)

### 2. Database Models
- **User Model**: Extended with additional settings fields
- **InteractionSettings**: User interaction preferences
- **ContentSettings**: Content management preferences
- **AppSettings**: Application preferences
- **AccountTools**: Professional tools settings
- **CloseFriends**: Close friends management
- **BlockedUsers**: Blocked users management
- **MutedUsers**: Muted users management
- **HiddenWords**: Hidden words management

## Setup Instructions

### 1. Database Setup
Run the SQL script to create the new tables:
```sql
-- Execute DatabaseUpdate.sql in your SQL Server database
```

### 2. Backend Setup
1. Ensure you have .NET 6.0 or later installed
2. Navigate to the project directory
3. Restore dependencies:
   ```bash
   dotnet restore
   ```
4. Build the project:
   ```bash
   dotnet build
   ```

### 3. Running the Backend
```bash
dotnet run
```
Or use the provided batch file:
```bash
start-backend-test.bat
```

The backend will be available at:
- **HTTPS**: `https://localhost:7000`
- **API Base**: `https://localhost:7000/api`

### 4. Frontend Integration
The frontend Settings.js has been updated to:
- Load settings from the new API endpoints
- Save settings using the new API endpoints
- Handle all settings categories (profile, privacy, notifications, etc.)

## API Documentation

### Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Profile Settings
```http
GET /api/Settings/profile
PUT /api/Settings/profile
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Travel enthusiast",
  "website": "https://example.com",
  "phoneNumber": "+1234567890",
  "birthDate": "1990-01-01",
  "gender": "male",
  "country": "USA"
}
```

### Privacy Settings
```http
GET /api/Settings/privacy
PUT /api/Settings/privacy
Content-Type: application/json

{
  "isPrivate": false,
  "allowComments": true,
  "allowTags": true,
  "allowMentions": true,
  "showActivityStatus": true
}
```

### Notification Settings
```http
GET /api/Settings/notifications
PUT /api/Settings/notifications
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true
}
```

### Account Settings
```http
GET /api/Settings/account
PUT /api/Settings/account
Content-Type: application/json

{
  "userName": "johndoe",
  "email": "john@example.com",
  "language": "en"
}
```

### Password Change
```http
PUT /api/Settings/password
Content-Type: application/json

{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## Error Handling
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: User not found
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: Server error

## Database Schema
The new tables are automatically created with proper foreign key relationships to the Users table. All settings are user-specific and will be deleted when a user is deleted (CASCADE DELETE).

## Testing
1. Start the backend server
2. Open the frontend application
3. Navigate to Settings page
4. Test each settings category:
   - Profile settings
   - Privacy settings
   - Notification settings
   - Account settings
   - Password change
   - Interaction settings
   - Content settings
   - App settings
   - Account tools

## Troubleshooting

### Common Issues
1. **404 Errors**: Ensure the database tables are created by running DatabaseUpdate.sql
2. **Authentication Errors**: Verify JWT token is valid and not expired
3. **Database Connection**: Check connection string in appsettings.json
4. **CORS Issues**: Ensure CORS is properly configured for your frontend domain

### Logs
Check the console output for detailed error messages and stack traces.

## Future Enhancements
- Add validation for email uniqueness
- Implement proper password hashing
- Add audit logging for settings changes
- Add bulk settings import/export
- Add settings templates for different user types
