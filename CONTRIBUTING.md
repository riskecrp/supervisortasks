# Contributing to Supervisor Tasks Management Dashboard

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

See the main [README.md](README.md) for detailed setup instructions.

### Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 5173
```

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Backend

- Use services for business logic
- Keep routes thin
- Handle errors properly
- Validate input data

### Frontend

- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript interfaces/types
- Handle loading and error states
- Use React Query for data fetching

## Testing

Before submitting a PR:

1. **Backend**: Test all API endpoints
2. **Frontend**: Test all pages and features
3. **Integration**: Ensure frontend and backend work together
4. **Google Sheets**: Verify data sync works correctly

## Pull Request Process

1. Update documentation if needed
2. Ensure code follows style guidelines
3. Test your changes thoroughly
4. Update the README if adding new features
5. Reference any related issues

## Reporting Bugs

When reporting bugs, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

## Feature Requests

Feature requests are welcome! Please include:

- Clear description of the feature
- Use case/motivation
- Proposed implementation (if applicable)

## Questions?

Feel free to open an issue for questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
