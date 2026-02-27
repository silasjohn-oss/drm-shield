# DRM Shield - Multi-File Support

## Overview
The system has been updated to support working with multiple PDF files instead of just a single file.

## Generated Sample Files

The following PDF files have been generated for testing:
- **sample.pdf** - Basic sample document
- **confidential-report.pdf** - Confidential business report
- **technical-specs.pdf** - Technical specifications
- **financial-summary.pdf** - Financial summary document
- **product-roadmap.pdf** - Product roadmap document

All files are located in: `uploads/`

## API Endpoints

### 1. List Available Files
**Endpoint:** `GET /drm/files`
**Authentication:** Required (Bearer token)
**Description:** Lists all available PDF files in the uploads folder

**Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/drm/files
```

**Response:**
```json
{
  "msg": "Available files",
  "files": [
    {
      "filename": "sample.pdf",
      "size": 1024
    },
    {
      "filename": "confidential-report.pdf",
      "size": 1024
    }
  ],
  "total": 5
}
```

### 2. Stream with File Selection
**Endpoint:** `GET /drm/stream`
**Query Parameters:**
- `uid` (required) - User ID
- `cid` (required) - Content ID
- `exp` (required) - Expiration timestamp
- `sig` (required) - Signature
- `file` (optional) - Filename to serve (default: sample.pdf)

**Description:** Streams a watermarked PDF file protected by DRM

**Request Examples:**
```bash
# Using default file (sample.pdf)
curl "http://localhost:3000/drm/stream?uid=1&cid=1&exp=<exp>&sig=<sig>"

# Using specific file
curl "http://localhost:3000/drm/stream?uid=1&cid=1&exp=<exp>&sig=<sig>&file=confidential-report.pdf"

# Using another file
curl "http://localhost:3000/drm/stream?uid=1&cid=1&exp=<exp>&sig=<sig>&file=technical-specs.pdf"
```

## Workflow to Test Multiple Files

### Step 1: Get Available Files
```bash
# First, authenticate
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# You'll get a token in the response

# List files
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/drm/files
```

### Step 2: Generate Signed Link
```bash
curl -X POST http://localhost:3000/drm/generate-link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contentId":1}'
```

### Step 3: Access File with DRM Protection
Use the signed URL with the `file` parameter:
```bash
curl "http://localhost:3000/drm/stream?uid=1&cid=1&exp=<exp>&sig=<sig>&file=confidential-report.pdf" \
  -o protected-file.pdf
```

## Adding More Files

### Manual Method
Simply place any PDF file in the `uploads/` folder:
```bash
cp your-file.pdf backend/uploads/
```

### Programmatic Method
Use the existing `/trace-leak` endpoint to upload files (with slight modifications):
A file upload endpoint can be added to handle multi-file uploads.

### Regenerate Samples
To regenerate all sample PDF files:
```bash
cd backend
node scripts/generateSamplePdfs.js
```

## Security Features

✅ **Directory Traversal Protection** - The system prevents access to files outside the uploads folder
✅ **File Type Validation** - Only PDF files are served
✅ **Signed URL Verification** - All streams require valid signed URLs
✅ **Session Validation** - Redis session check ensures user auth
✅ **Watermarking** - All accessed files are watermarked with user information
✅ **Access Logging** - All file access is logged for audit trails

## File Management

All uploaded files are organized in:
- `/uploads/` - Raw PDF files ready for streaming
- `/uploads/temp/` - Temporary watermarked files (auto-cleaned)
- `/uploads/encrypted/` - Encrypted files (if using encryption service)
- `/uploads/raw/` - Uploaded raw files

