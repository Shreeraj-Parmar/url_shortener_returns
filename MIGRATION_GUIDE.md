# API v1 to v2 Migration Guide (Authentication)

Welcome to the new version of the URL Shortener API! 

To improve security, prevent abuse, and introduce subscription tiers, we have introduced a major change: **All API requests now require Authentication via an API Key.**

This guide will help you update your integrations from v1 (unauthenticated) to v2 (authenticated).

## 📅 Timeline & Deprecation
- **Current Status:** v1 is currently deprecated. You may notice a `299 - API v1 is deprecated` warning in the response headers of your v1 requests.
- **End of Life (EOL):** The v1 unauthenticated API will be completely removed and stop functioning on **August 1st, 2026**. Please migrate before this date to ensure uninterrupted service.

## 🔑 How to get an API Key
1. Log in to your developer dashboard at `https://your-url-shortener.com/dashboard`.
2. Navigate to the **API Settings** tab.
3. Click **Generate New API Key**.
4. Copy this key and keep it secure. **Do not share it or commit it to public repositories.**

## 🛠️ Making Requests (Before vs. After)

Previously, you could make requests to the API without any headers. Now, you must include your API key in the `x-api-key` header of every request.

### Example: Creating a Short URL

**Before (v1 - Unauthenticated):**
```bash
curl -X POST http://api.your-url-shortener.com/v1/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**After (v2 - Authenticated):**
```bash
curl -X POST http://api.your-url-shortener.com/v2/shorten \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{"url": "https://example.com"}'
```

## ⚠️ New Error Codes to Handle
Because of the new authentication system, your application should be prepared to handle the following new HTTP status codes:

- **`401 Unauthorized`**: You did not provide an `x-api-key` header, or the key provided is completely invalid.
- **`403 Forbidden`**: The key provided is valid, but it has been blacklisted or your subscription tier does not allow access to the requested endpoint.

## 🤝 Need Help?
If you have any questions or need assistance with the migration, please reach out to our developer support team at `support@your-url-shortener.com`.
