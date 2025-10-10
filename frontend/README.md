# BingGo English Learning - Frontend

This is the React frontend application for the BingGo English Learning web platform.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production
```bash
npm run build
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (buttons, inputs, etc.)
│   ├── flashcard/      # Flashcard-related components
│   ├── exercise/       # Exercise and test components
│   ├── video/          # Video player components
│   ├── badge/          # Badge system components
│   ├── progress/       # Progress tracking components
│   └── auth/           # Authentication components
├── pages/              # Page components
│   ├── student/        # Student dashboard and features
│   ├── teacher/        # Teacher dashboard and features
│   ├── admin/          # Admin dashboard and features
│   └── auth/           # Login and registration pages
├── services/           # API services and external integrations
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts (Auth, Theme, etc.)
└── assets/             # Static assets (images, fonts, etc.)
```

## 🛠 Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **React Testing Library** - Testing utilities

## 🎯 Features

- ✅ TypeScript support for type safety
- ✅ ESLint and Prettier for code quality
- ✅ Scalable folder structure
- ✅ Authentication context setup
- ✅ API service layer
- ✅ Utility functions and custom hooks
- ✅ Responsive design ready
- ✅ Development environment configured

## 📝 Development Guidelines

1. **Components**: Create reusable components in the appropriate subdirectory
2. **Types**: Define TypeScript interfaces in `src/types/`
3. **Services**: Keep API calls in `src/services/`
4. **Hooks**: Custom hooks go in `src/hooks/`
5. **Utils**: Helper functions in `src/utils/`

## 🔧 Configuration

- **ESLint**: `.eslintrc.json`
- **Prettier**: `.prettierrc`
- **TypeScript**: `tsconfig.json`

## 🚀 Next Steps

1. Integrate Firebase Authentication
2. Setup React Router for navigation
3. Implement UI component library
4. Add state management (Context API or Redux)
5. Create responsive layouts