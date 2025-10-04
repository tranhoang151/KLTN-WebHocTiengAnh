# BingGo Web Application - Development Environment Setup

This guide will help you set up the development environment for the BingGo English Learning Web Application.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- Firebase project with Firestore and Authentication enabled

## Quick Setup

1. **Clone the repository and navigate to the project directory**

2. **Run the setup script:**
   ```powershell
   ./scripts/setup-dev.ps1
   ```

3. **Configure environment variables:**
   - Edit `.env` file with your Firebase configuration
   - Edit `backend/.env` file with your Firebase Admin SDK configuration

4. **Start the development environment:**
   ```powershell
   docker-compose up
   ```

5. **Migrate your data:**
   ```powershell
   ./scripts/migrate-data.ps1
   ```

## Manual Setup

### 1. Environment Configuration

#### Frontend Environment (.env)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

#### Backend Environment (backend/.env)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
cd ..
```

#### Backend
```bash
cd backend
dotnet restore
cd ..
```

### 3. Docker Setup

Build and start the containers:
```bash
docker-compose up --build
```

Or run in detached mode:
```bash
docker-compose up -d
```

### 4. Data Migration

After the services are running, migrate your existing data:
```powershell
./scripts/migrate-data.ps1
```

You can also specify a different backup file:
```powershell
./scripts/migrate-data.ps1 -BackupFile "WebConversion/backup.json"
```

## Development Workflow

### Using Docker (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after changes:**
   ```bash
   docker-compose up --build
   ```

### Using VS Code

1. **Open the workspace in VS Code**

2. **Use the provided launch configurations:**
   - `Launch Full Stack` - Starts both frontend and backend
   - `Launch Backend (.NET Core)` - Starts only the backend
   - `Launch Frontend (Chrome)` - Opens frontend in Chrome for debugging

3. **Use the provided tasks:**
   - `Ctrl+Shift+P` → `Tasks: Run Task`
   - Select from available tasks like `build-backend`, `start-frontend`, etc.

### Manual Development

#### Frontend Development
```bash
cd frontend
npm start
```
The frontend will be available at http://localhost:3000

#### Backend Development
```bash
cd backend
dotnet watch run
```
The backend API will be available at http://localhost:5000

## Services and Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 3000 | http://localhost:3000 |
| Backend (ASP.NET Core) | 5000 | http://localhost:5000 |
| Swagger UI | 5000 | http://localhost:5000/swagger |

## Hot Reload

Both frontend and backend are configured for hot reload:

- **Frontend**: Changes to React components will automatically refresh the browser
- **Backend**: Changes to C# files will automatically restart the API server

## Debugging

### VS Code Debugging

1. Set breakpoints in your code
2. Press `F5` or use the Debug panel
3. Select the appropriate launch configuration

### Browser Debugging

- Frontend: Use Chrome DevTools (F12)
- Network requests: Monitor in DevTools Network tab

## Data Migration

The migration system supports:

- **Badges**: User achievement badges
- **Courses**: Learning courses
- **Classes**: Student classes
- **Users**: Student, teacher, admin, and parent accounts
- **Flashcard Sets**: Collections of flashcards
- **Flashcards**: Individual learning cards
- **Exercises**: Practice exercises
- **Questions**: Question bank for exercises and tests
- **Tests**: Timed assessments
- **Videos**: YouTube video lessons

### Migration Endpoints

- `POST /api/migration/migrate?backupFile=backup.json` - Start migration
- `POST /api/migration/validate` - Validate data integrity
- `GET /api/migration/summary` - Get migration summary

## Troubleshooting

### Common Issues

1. **Docker containers won't start:**
   - Check if ports 3000 and 5000 are available
   - Ensure Docker Desktop is running
   - Check environment variables are set correctly

2. **Firebase connection errors:**
   - Verify Firebase configuration in .env files
   - Check Firebase project settings
   - Ensure Firestore and Authentication are enabled

3. **Migration fails:**
   - Check if backup.json file exists
   - Verify Firebase Admin SDK credentials
   - Check API logs for detailed error messages

4. **Hot reload not working:**
   - For Windows: Ensure CHOKIDAR_USEPOLLING=true is set
   - Restart the containers: `docker-compose restart`

### Logs

- **Frontend logs**: Available in browser console and Docker logs
- **Backend logs**: Available in `backend/logs/` directory and Docker logs
- **Docker logs**: `docker-compose logs [service_name]`

### Reset Development Environment

To completely reset your development environment:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (this will delete data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild everything
docker-compose up --build
```

## Next Steps

After setting up the development environment:

1. **Explore the codebase** - Familiarize yourself with the project structure
2. **Run tests** - Execute unit and integration tests
3. **Start development** - Begin implementing new features
4. **Review documentation** - Check the design and requirements documents

For more information, see:
- [Requirements Document](.kiro/specs/binggo-web-conversion/requirements.md)
- [Design Document](.kiro/specs/binggo-web-conversion/design.md)
- [Implementation Tasks](.kiro/specs/binggo-web-conversion/tasks.md)