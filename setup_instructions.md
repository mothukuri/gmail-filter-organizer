# Gmail Filter Manager - Desktop Application

A modern desktop application built with Electron and React for managing Gmail filters and email organization.

## Features

- 🔐 Secure Gmail API authentication
- 📧 View and manage existing Gmail filters
- ➕ Create new filters with advanced criteria
- 🏷️ Label management integration
- 🗑️ Delete unwanted filters
- 💾 Persistent credential storage
- 🔄 Real-time filter synchronization
- 🎨 Modern, intuitive interface

## Tech Stack

- **Desktop Framework**: Electron
- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Gmail API v1
- **Storage**: Electron Store for secure credential storage
- **Build**: Electron Builder for cross-platform packaging

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Gmail API credentials** from Google Cloud Console

## Gmail API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Desktop application"
4. Name your OAuth client
5. Note down the **Client ID** and **Client Secret**
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `urn:ietf:wg:oauth:2.0:oob`

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have a G Suite domain)
3. Fill in required fields:
   - Application name
   - User support email
   - Developer contact information
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.settings.basic`
   - `https://www.googleapis.com/auth/gmail.settings.sharing`

## Installation & Setup

### Step 1: Clone and Install Dependencies

```bash
# Create a new React app
npx create-react-app gmail-filter-manager
cd gmail-filter-manager

# Install additional dependencies
npm install electron electron-builder concurrently wait-on
npm install googleapis electron-store lucide-react
npm install electron-is-dev

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Project Structure

Create the following project structure:

```
gmail-filter-manager/
├── public/
│   ├── electron.js          # Main Electron process
│   └── index.html
├── src/
│   ├── App.js              # Main React component
│   ├── App.css             # Styles
│   └── index.js
├── package.json
└── README.md
```

### Step 3: Configure Tailwind CSS

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Copy Application Files

1. Copy the `package.json` content from the first artifact
2. Copy the Electron main process code to `public/electron.js`
3. Copy the React application code to `src/App.js`
4. Copy the CSS styles to `src/App.css`

### Step 5: Install Dependencies

```bash
npm install
```

## Running the Application

### Development Mode

```bash
# Start the application in development mode
npm run electron-dev
```

This will:
1. Start the React development server on `http://localhost:3000`
2. Launch Electron and load the React app

### Production Build

```bash
# Build the React app and package Electron
npm run electron-pack
```

This creates distributable packages in the `dist/` folder for your platform.

## Configuration

### First-Time Setup

1. **Launch the application**
2. **Navigate to Settings** (gear icon in sidebar)
3. **Enter your Gmail API credentials**:
   - Client ID
   - Client Secret
   - Redirect URI (default: `http://localhost:3000/auth/callback`)
4. **Save credentials**
5. **Click "Connect to Gmail"**
6. **Complete OAuth flow** in your browser
7. **Return to the application** - you should now see "Connected" status

### Authentication Flow

The application uses OAuth 2.0 for secure authentication:

1. User clicks "Connect to Gmail"
2. Application generates authorization URL
3. Default browser opens with Google's consent screen
4. User grants permissions
5. Google redirects with authorization code
6. Application exchanges code for access/refresh tokens
7. Tokens are securely stored using Electron Store

## Usage

### Viewing Filters

1. Navigate to the "Filters" tab
2. Click "Refresh" to load current Gmail filters
3. View filter criteria and actions
4. Delete filters using the trash icon

### Creating Filters

1. Navigate to "Create Filter" tab
2. **Set criteria**:
   - From: sender email address
   - To: recipient email address
   - Subject: subject line contains
   - Query: advanced Gmail search syntax
   - Has attachment checkbox
   - Exclude chats checkbox
3. **Choose actions**:
   - Add/remove labels
   - Mark as read/important
   - Forward to email
   - Delete email
   - Never mark as spam
4. Click "Create Filter"

### Filter Examples

**Promotional emails to folder**:
- Criteria: From contains "noreply"
- Action: Add label "Promotions", Mark as read

**Important project emails**:
- Criteria: Subject contains "[PROJECT]"
- Action: Add label "Work/Projects", Mark as important

**Auto-forward support emails**:
- Criteria: To contains "support@"
- Action: Forward to "support-team@company.com"

## Security

- **Credentials**: Stored securely using Electron Store with OS keychain integration
- **Tokens**: Access and refresh tokens encrypted at rest
- **Scopes**: Minimal required Gmail permissions
- **Network**: All API calls use HTTPS
- **No data storage**: No email content stored locally

## Troubleshooting

### Common Issues

**"Credentials not configured" error**:
- Ensure you've entered valid Client ID and Client Secret in Settings
- Verify the redirect URI matches your OAuth client configuration

**Authentication fails**:
- Check that Gmail API is enabled in Google Cloud Console
- Verify OAuth consent screen is configured
- Ensure your Google account has necessary permissions

**"Access blocked" during OAuth**:
- Your app may be in testing mode - add your email to test users
- Or publish your OAuth consent screen for production use

**Filters not loading**:
- Check network connectivity
- Verify tokens haven't expired (app should auto-refresh)
- Try disconnecting and reconnecting Gmail

### Development Issues

**Electron won't start**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails**:
```bash
# Ensure all dependencies are installed
npm install --production=false
npm run build
```

## Deployment

### Building for Distribution

```bash
# Windows
npm run electron-pack -- --win

# macOS
npm run electron-pack -- --mac

# Linux
npm run electron-pack -- --linux
```

### Code Signing (Production)

For production releases, configure code signing in `package.json`:

```json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name"
  },
  "win": {
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "password"
  }
}
```

## Advanced Features

### Custom Label Colors

Extend the application to support Gmail's label color system by modifying the label display logic.

### Batch Filter Operations

Add functionality to:
- Import/export filter configurations
- Apply filters to existing emails
- Bulk delete multiple filters

### Filter Templates

Create predefined filter templates for common use cases:
- Newsletter management
- Work email organization
- Shopping receipt handling

## API Reference

### Gmail API Endpoints Used

- `GET /gmail/v1/users/{userId}/settings/filters` - List filters
- `POST /gmail/v1/users/{userId}/settings/filters` - Create filter
- `DELETE /gmail/v1/users/{userId}/settings/filters/{id}` - Delete filter
- `GET /gmail/v1/users/{userId}/labels` - List labels

### Electron IPC Methods

- `get-auth-url` - Generate OAuth URL
- `exchange-code` - Exchange auth code for tokens
- `get-gmail-filters` - Fetch user's filters
- `create-gmail-filter` - Create new filter
- `delete-gmail-filter` - Delete existing filter
- `get-gmail-labels` - Fetch user's labels
- `save-credentials` - Store API credentials
- `get-credentials` - Retrieve stored credentials
- `check-auth-status` - Verify authentication state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Gmail API documentation
3. Create an issue on GitHub with detailed error information

---

**Happy email organizing! 📧✨**