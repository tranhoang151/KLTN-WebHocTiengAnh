# BingGo Web API

ASP.NET Core 8 Web API for the BingGo English Learning web application.

## Features

- **Firebase Integration**: Authentication, Firestore database, and Storage
- **CORS Support**: Configured for React frontend
- **Global Exception Handling**: Centralized error handling middleware
- **Logging**: Structured logging with Serilog
- **Caching**: Memory caching for improved performance
- **Health Checks**: API health monitoring endpoints
- **Docker Support**: Containerized deployment

## Prerequisites

- .NET 8.0 SDK
- Firebase project with service account key
- Docker (optional, for containerized deployment)

## Setup

### 1. Firebase Configuration

1. Place your Firebase service account JSON file in the project root or update the path in `appsettings.Development.json`
2. Update the Firebase project ID in configuration files

### 2. Local Development

```bash
# Restore dependencies
dotnet restore

# Run the application
dotnet run

# Or run with hot reload
dotnet watch run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

### 3. Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/firebase` - Firebase connection check

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/{id}` - Update course

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user

### Flashcards
- `GET /api/flashcards/sets/{courseId}` - Get flashcard sets by course
- `GET /api/flashcards/set/{setId}/cards` - Get flashcards by set
- `POST /api/flashcards/progress` - Update flashcard progress

### Exercises
- `GET /api/exercises/{courseId}` - Get exercises by course
- `POST /api/exercises/submit` - Submit exercise answers

### Badges
- `GET /api/badges/{userId}` - Get user badges
- `POST /api/badges/check` - Check and award badges

## Configuration

### Environment Variables

- `ASPNETCORE_ENVIRONMENT` - Environment (Development, Production)
- `Firebase__ProjectId` - Firebase project ID
- `Firebase__ServiceAccountKeyPath` - Path to Firebase service account key

### appsettings.json

```json
{
  "Firebase": {
    "ServiceAccountKeyPath": "firebase-service-account.json",
    "ProjectId": "your-firebase-project-id"
  }
}
```

## Project Structure

```
backend/
├── Controllers/          # API controllers
├── Services/            # Business logic services
├── Models/              # Data models and DTOs
├── Middleware/          # Custom middleware
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── README.md           # This file
```

## Development Guidelines

### Adding New Controllers

1. Create controller in `Controllers/` folder
2. Inherit from `ControllerBase`
3. Add `[ApiController]` and `[Route]` attributes
4. Implement dependency injection in constructor

### Adding New Services

1. Create interface in `Services/` folder
2. Implement service class
3. Register in `Program.cs` dependency injection
4. Use caching where appropriate

### Error Handling

- Use appropriate HTTP status codes
- Throw specific exceptions (ArgumentException, KeyNotFoundException, etc.)
- Global exception middleware will handle formatting

### Logging

- Use structured logging with Serilog
- Log important operations and errors
- Include relevant context (user ID, operation details)

## Testing

```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Deployment

### Production Configuration

1. Update `appsettings.Production.json` with production settings
2. Ensure Firebase service account key is securely stored
3. Configure HTTPS certificates
4. Set up monitoring and logging

### Docker Production

```bash
# Build production image
docker build -t binggo-api:latest .

# Run production container
docker run -d -p 80:80 -p 443:443 \
  -v /path/to/firebase-key.json:/app/firebase-service-account.json:ro \
  -e ASPNETCORE_ENVIRONMENT=Production \
  binggo-api:latest
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify service account key path
   - Check Firebase project ID
   - Ensure proper permissions on service account

2. **CORS Issues**
   - Verify frontend URL in CORS configuration
   - Check that CORS middleware is properly configured

3. **Port Conflicts**
   - Change ports in `launchSettings.json` or Docker configuration
   - Ensure ports are not in use by other applications

### Logs

- Application logs are written to `logs/` directory
- Use `docker-compose logs` for containerized applications
- Check console output for immediate debugging

## Contributing

1. Follow existing code style and patterns
2. Add unit tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting changes