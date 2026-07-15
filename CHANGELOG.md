# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-07-15

### Added
- **Sentry Integration**: Added Sentry profiling integration and error monitoring to the instrumentation module.
- **Debug Route**: Added Sentry log level test messages to the debug route to verify error tracking.
- **Time Tracking Middleware**: Implemented middleware to track execution time and apply it to all API routes.
- **Response Time Header**: Added middleware to track and include the `X-Response-Time` header in responses.
- **Blacklisting Middleware**: Implemented API key blacklisting and subscription tier validation middlewares.

### Changed
- **Authentication**: Refactored authentication middleware to handle API key validation and user injection across routes.
- **Performance**: Changed the blacklist to load once at server startup to reduce redundant file I/O operations.

### Fixed
- **Error Messages**: Updated missing URL error message and synchronized the corresponding test cases.
- **Test Expectations**: Updated error message expectations for missing API keys in validation tests.
