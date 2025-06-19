# Migration from Vercel Blob to Local File Storage

This guide explains the migration from Vercel Blob storage to local file storage for image uploads.

## Changes Made

### 1. Removed Vercel Blob Dependencies
- Removed `@vercel/blob` package from `package.json`
- Removed all imports of `put` and `del` from `@vercel/blob`
- Removed `VERCEL_BLOB_READ_WRITE_TOKEN` environment variable requirement

### 2. Updated ImageService
- **Location**: `src/lib/services/ImageService.ts`
- **Changes**:
  - Replaced Vercel Blob `put()` calls with local `fs.writeFile()`
  - Replaced Vercel Blob `del()` calls with local `fs.unlink()`
  - Added automatic directory creation for upload folders
  - Images are now saved to `/public/uploads/listings/` and `/public/uploads/realtors/`
  - Returns local paths like `/uploads/listings/filename.ext`

### 3. Updated File Structure
- Created upload directories:
  - `/public/uploads/listings/` - For listing images
  - `/public/uploads/realtors/` - For realtor profile photos
- Added `/public/uploads/` to `.gitignore` to avoid committing large files

### 4. Updated Scripts
- **restore.js**: Updated to copy images to local storage instead of uploading to Vercel Blob
- **migrate-to-local-storage.js**: New script to convert existing Vercel Blob URLs in database

## Migration Steps

### For New Installations
No additional steps needed. The application will automatically:
1. Create upload directories when needed
2. Save new images to local storage
3. Generate thumbnails locally

### For Existing Installations with Vercel Blob Images

1. **Download Your Existing Images** (if you have any):
   ```bash
   # You'll need to manually download images from Vercel Blob
   # and place them in the appropriate directories:
   # /public/uploads/listings/
   # /public/uploads/realtors/
   ```

2. **Run the Migration Script**:
   ```bash
   npm run migrate-to-local
   ```

3. **Verify the Migration**:
   - Check that images display correctly in your application
   - Verify that new uploads work properly
   - Test image deletion functionality

## File Storage Details

### Directory Structure
```
public/
├── uploads/
│   ├── listings/
│   │   ├── [uuid].jpg         # Original images
│   │   ├── [uuid]-thumb.webp  # 200x200 thumbnails
│   │   ├── [uuid]-medium.webp # 600px wide thumbnails
│   │   └── [uuid]-large.webp  # 1200px wide thumbnails
│   └── realtors/
│       ├── [uuid].jpg         # Original images
│       ├── [uuid]-thumb.webp  # 200x200 thumbnails
│       ├── [uuid]-medium.webp # 600px wide thumbnails
│       └── [uuid]-large.webp  # 1200px wide thumbnails
```

### Image Processing
- **Original images**: Saved in their original format
- **Thumbnails**: Always converted to WebP format for better compression
- **Sizes generated**:
  - `thumb`: 200x200 pixels (square)
  - `medium`: 600px wide (maintaining aspect ratio)
  - `large`: 1200px wide (maintaining aspect ratio)

### URL Format
- **Before**: `https://[random].blob.vercel-storage.com/[path]/[filename]`
- **After**: `/uploads/[subdirectory]/[filename]`

## Benefits of Local Storage

1. **No External Dependencies**: No need for Vercel Blob tokens or API calls
2. **Faster Access**: Images served directly from your server
3. **Full Control**: Complete control over file management
4. **Cost Effective**: No storage or bandwidth charges
5. **Simpler Deployment**: One less service to configure

## Backup Considerations

Since images are now stored locally, make sure to:

1. **Include uploads in your backup strategy**
2. **Consider using a CDN** for better performance if needed
3. **Monitor disk space** usage for the uploads directory

## Troubleshooting

### Images Not Displaying
1. Check that the upload directories exist and are writable
2. Verify that the database has the correct local paths
3. Ensure your web server can serve files from `/public/uploads/`

### Upload Failures
1. Check file permissions on the uploads directory
2. Verify available disk space
3. Check server logs for detailed error messages

### Migration Issues
1. Run the migration script with `npm run migrate-to-local`
2. Check that image files are in the correct directories
3. Verify database paths match actual file locations

## Development vs Production

### Development
- Images stored in `/public/uploads/` in your project directory
- Served directly by Next.js development server

### Production
- Images stored in `/public/uploads/` on your server
- Served by your web server (Nginx, Apache, etc.)
- Consider using a CDN for better performance and caching 