# 📋 Quick Reference - Multi-File DRM Shield

## Available Commands

### Generate Sample Files
```bash
cd backend
npm run generate-samples
```

### Create Custom PDF File
```bash
node scripts/createCustomPdf.js "filename.pdf" "Document Title" "Document content here..."
```

### Example Custom PDF Creation
```bash
node scripts/createCustomPdf.js "contract.pdf" "Service Agreement" "This is our service agreement..."
node scripts/createCustomPdf.js "manual.pdf" "User Manual" "How to use this product..."
```

## API Quick Reference

### 1. List All Files
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/drm/files
```

### 2. Generate Access Link
```bash
curl -X POST http://localhost:3000/drm/generate-link \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentId":1}'
```

### 3. Download Protected PDF (Default File)
```bash
curl "http://localhost:3000/drm/stream?uid=USER_ID&cid=CONTENT_ID&exp=EXPIRY&sig=SIGNATURE" \
  -o protected-file.pdf
```

### 4. Download Specific Protected PDF
```bash
# Download confidential-report.pdf with DRM protection
curl "http://localhost:3000/drm/stream?uid=USER_ID&cid=CONTENT_ID&exp=EXPIRY&sig=SIGNATURE&file=confidential-report.pdf" \
  -o protected-report.pdf

# Download technical-specs.pdf
curl "http://localhost:3000/drm/stream?uid=USER_ID&cid=CONTENT_ID&exp=EXPIRY&sig=SIGNATURE&file=technical-specs.pdf" \
  -o protected-specs.pdf

# Download financial-summary.pdf
curl "http://localhost:3000/drm/stream?uid=USER_ID&cid=CONTENT_ID&exp=EXPIRY&sig=SIGNATURE&file=financial-summary.pdf" \
  -o protected-financial.pdf
```

## Currently Available Files

| Filename | Description | Size |
|----------|-------------|------|
| sample.pdf | Basic sample document | ~1 KB |
| confidential-report.pdf | Business report | ~1 KB |
| technical-specs.pdf | Technical documentation | ~1 KB |
| financial-summary.pdf | Financial data | ~1 KB |
| product-roadmap.pdf | Product planning | ~1 KB |

## Adding Your Own Files

### Method 1: Manual Copy
```bash
cp your-document.pdf backend/uploads/
```

### Method 2: Script Generate
```bash
node scripts/createCustomPdf.js "my-file.pdf" "My Title" "My content..."
```

### Method 3: Place in Directory
Simply copy/move any PDF to `backend/uploads/` and it will be available

## Full Workflow Example

```bash
# 1. Start server (in another terminal)
cd backend && npm start

# 2. Create a custom PDF
node scripts/createCustomPdf.js "important.pdf" "Important Document" "This is important content"

# 3. Register user (if not registered)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 4. Login
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# 5. List available files
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/drm/files

# 6. Generate access link
LINK=$(curl -X POST http://localhost:3000/drm/generate-link \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentId":1}' | jq -r '.secureUrl')

# 7. Access protected file
curl "$LINK&file=important.pdf" -o my-protected-file.pdf
```

## Troubleshooting

**Q: File not showing in /drm/files**
A: Make sure file is in `backend/uploads/` and is a `.pdf` file

**Q: "File not found" error when streaming**
A: Check the filename matches exactly (case-sensitive on Linux/Mac)

**Q: Want to remove a file**
A: Simply delete it from `backend/uploads/` folder

**Q: Need to regenerate samples**
A: Run `npm run generate-samples` in backend folder

## Key Security Features

✅ Only authenticated users can list files  
✅ Signed URLs with expiration  
✅ Directory traversal protection  
✅ File type validation (PDF only)  
✅ User watermarking on download  
✅ Session validation  
✅ Full audit logging  

