# TubeQueue Documentation

Welcome to the TubeQueue documentation! This folder contains all technical documentation for the YouTube Jukebox application.

## 📚 Documentation Index

### Getting Started
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Complete guide for setting up environment variables
- **[setup-youtube-api.md](./setup-youtube-api.md)** - Quick guide to enable YouTube API integration

### Architecture & Security
- **[TOKEN_SECURITY.md](./TOKEN_SECURITY.md)** - Detailed explanation of the secure token refresh system
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Summary of token security refactor changes
- **[blueprint.md](./blueprint.md)** - Original project blueprint and design guidelines

### Authentication & Authorization
- **[YOUTUBE_AUTH_STATUS.md](./YOUTUBE_AUTH_STATUS.md)** - YouTube OAuth implementation details
- **[DEPLOY_RULES.md](./DEPLOY_RULES.md)** - How to deploy Firestore security rules

### Backend Reference
- **[backend.json](./backend.json)** - Backend API schema and structure

---

## 🎯 Quick Links by Task

### "I want to set up the project"
1. Start with [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
2. Follow [setup-youtube-api.md](./setup-youtube-api.md) for YouTube integration
3. Deploy security rules using [DEPLOY_RULES.md](./DEPLOY_RULES.md)

### "I want to understand how authentication works"
1. Read [YOUTUBE_AUTH_STATUS.md](./YOUTUBE_AUTH_STATUS.md) for OAuth flow
2. Review [TOKEN_SECURITY.md](./TOKEN_SECURITY.md) for token management

### "I want to see what changed recently"
1. Check [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) for recent updates
2. Review [TOKEN_SECURITY.md](./TOKEN_SECURITY.md) for security improvements

### "I want to understand the architecture"
1. Start with [blueprint.md](./blueprint.md) for project overview
2. Read [TOKEN_SECURITY.md](./TOKEN_SECURITY.md) for security architecture
3. Check [backend.json](./backend.json) for API reference

---

## 🔐 Security Documentation

The most important security documentation:
- **Token Management**: [TOKEN_SECURITY.md](./TOKEN_SECURITY.md)
- **Firestore Rules**: [DEPLOY_RULES.md](./DEPLOY_RULES.md)
- **OAuth Setup**: [YOUTUBE_AUTH_STATUS.md](./YOUTUBE_AUTH_STATUS.md)

---

## 🚀 Deployment

For production deployment:
1. Configure environment variables: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
2. Deploy Firestore rules: [DEPLOY_RULES.md](./DEPLOY_RULES.md)
3. Set up YouTube API: [setup-youtube-api.md](./setup-youtube-api.md)

---

## 📝 Contributing

When adding new documentation:
1. Place all documentation in this `/docs` folder
2. Update this README.md to include links to new docs
3. Use clear, descriptive filenames
4. Include code examples where applicable
5. Keep documentation up-to-date with code changes

