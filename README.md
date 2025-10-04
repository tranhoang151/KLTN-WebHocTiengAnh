# BingGo English Learning Web Application

A comprehensive web application for English learning designed for students aged 5-12, teachers, administrators, and parents at BingGo English Center.

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Firebase project with Firestore and Authentication

### Setup Development Environment

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd binggo-web-app
   ./scripts/setup-dev.ps1
   ```

2. **Configure environment variables:**
   - Edit `.env` with your Firebase web config
   - Edit `backend/.env` with your Firebase Admin SDK config

3. **Start development environment:**
   ```bash
   docker-compose up
   ```

4. **Migrate existing data:**
   ```bash
   ./scripts/migrate-data.ps1
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger

For detailed setup instructions, see [DEV_SETUP.md](DEV_SETUP.md).

## 📋 Features

### 🎓 Learning Features
- **Interactive Flashcards** - Animated flip cards with progress tracking
- **Exercises & Tests** - Multiple choice and fill-in-the-blank questions
- **Video Lessons** - YouTube integration with progress tracking
- **Progress Analytics** - Comprehensive learning statistics

### 🏆 Gamification
- **Badge System** - Achievement badges for motivation
- **Learning Streaks** - Daily learning streak tracking
- **Progress Rewards** - Milestone celebrations

### 👥 User Management
- **Role-based Access** - Student, Teacher, Admin, Parent roles
- **Class Management** - Course and class organization
- **Content Assignment** - Teacher-controlled content distribution

### 🔧 Technical Features
- **Firebase Integration** - Authentication, Firestore, Storage
- **Responsive Design** - Mobile, tablet, and desktop support
- **Real-time Updates** - Live progress and badge notifications
- **Data Migration** - Import from existing Android app data

## 🏗️ Architecture

### Frontend (React)
- **React 18** with functional components and hooks
- **Firebase SDK** for authentication and real-time data
- **Responsive CSS** with mobile-first design
- **Component-based architecture** for reusability

### Backend (ASP.NET Core)
- **ASP.NET Core 8** Web API
- **Firebase Admin SDK** for server-side operations
- **RESTful API design** with OpenAPI documentation
- **Structured logging** with Serilog

### Database (Firebase Firestore)
- **NoSQL document database** for flexibility
- **Real-time synchronization** across clients
- **Security rules** for role-based access control
- **Scalable architecture** with Firebase's infrastructure

## 📁 Project Structure

```
binggo-web-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and Firebase services
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # ASP.NET Core API
│   ├── Controllers/        # API controllers
│   ├── Services/           # Business logic services
│   ├── Models/             # Data models and DTOs
│   ├── Middleware/         # Custom middleware
│   └── BingGoWebAPI.csproj # Backend dependencies
├── scripts/                # Development scripts
│   ├── setup-dev.ps1      # Environment setup
│   ├── migrate-data.ps1   # Data migration
│   └── validate-setup.ps1 # Setup validation
├── .vscode/                # VS Code configuration
├── docker-compose.yml      # Docker development setup
└── DEV_SETUP.md           # Detailed setup guide
```

## 🔄 Development Workflow

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build

# Stop services
docker-compose down
```

### Manual Development
```bash
# Frontend
cd frontend && npm start

# Backend
cd backend && dotnet watch run
```

### VS Code Integration
- Use `F5` to start debugging
- Launch configurations for full-stack debugging
- Integrated terminal tasks for common operations

## 📊 Data Migration

The application includes a comprehensive data migration system:

### Supported Data Types
- **Users** - Students, teachers, admins, parents
- **Courses** - Learning course definitions
- **Classes** - Student class assignments
- **Flashcards** - Learning card sets and individual cards
- **Exercises** - Practice exercises and questions
- **Tests** - Timed assessments
- **Videos** - YouTube lesson integration
- **Badges** - Achievement system data

### Migration Process
1. **Backup Validation** - Verify data integrity
2. **Schema Mapping** - Convert Android app data to web format
3. **Batch Processing** - Efficient Firestore operations
4. **Relationship Validation** - Ensure data consistency
5. **Progress Reporting** - Real-time migration status

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run unit tests
npm run test:coverage      # Run with coverage
```

### Backend Testing
```bash
cd backend
dotnet test                # Run unit tests
dotnet test --collect:"XPlat Code Coverage"  # With coverage
```

### Integration Testing
- API endpoint testing
- Firebase integration testing
- End-to-end user workflow testing

## 🚀 Deployment

### Development
- Docker Compose for local development
- Hot reload for both frontend and backend
- VS Code debugging integration

### Production
- Docker containers for scalable deployment
- Environment-specific configuration
- Firebase hosting for frontend
- Cloud hosting for backend API

## 📚 Documentation

- [Requirements Document](.kiro/specs/binggo-web-conversion/requirements.md)
- [Design Document](.kiro/specs/binggo-web-conversion/design.md)
- [Implementation Tasks](.kiro/specs/binggo-web-conversion/tasks.md)
- [Development Setup Guide](DEV_SETUP.md)
- [Backend API Documentation](backend/README.md)

## 🤝 Contributing

1. **Setup Development Environment**
   ```bash
   ./scripts/setup-dev.ps1
   ./scripts/validate-setup.ps1
   ```

2. **Follow Development Guidelines**
   - Use TypeScript for frontend development
   - Follow C# conventions for backend
   - Write unit tests for new features
   - Update documentation for changes

3. **Testing Before Submission**
   - Run all tests locally
   - Validate with migration scripts
   - Test across different screen sizes
   - Verify Firebase integration

## 🔧 Troubleshooting

### Common Issues

1. **Docker Issues**
   - Ensure Docker Desktop is running
   - Check port availability (3000, 5000)
   - Verify environment variables

2. **Firebase Connection**
   - Verify Firebase project configuration
   - Check service account permissions
   - Ensure Firestore and Auth are enabled

3. **Migration Problems**
   - Validate backup.json file format
   - Check Firebase Admin SDK credentials
   - Review migration logs for details

### Getting Help

- Check the [troubleshooting section](DEV_SETUP.md#troubleshooting) in DEV_SETUP.md
- Review application logs in `backend/logs/`
- Use `docker-compose logs` for container issues
- Validate setup with `./scripts/validate-setup.ps1`

## 📄 License

This project is proprietary software for BingGo English Center.

## 📞 Support

For technical support or questions about the development environment, please refer to the documentation or contact the development team.