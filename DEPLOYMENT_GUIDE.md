# 🚀 Deployment Guide for cPanel

## Files Ready for Upload

Your production build is ready in the `dist` folder. Upload these files to your cPanel:

### Files to Upload:
- `dist/index.html` → `public_html/index.html`
- `dist/assets/` → `public_html/assets/`
- `dist/vite.svg` → `public_html/vite.svg` (if present)
- `.htaccess` → `public_html/.htaccess`

## Step-by-Step cPanel Deployment

### 1. Access cPanel
- Log into your hosting account
- Open cPanel dashboard
- Click on **File Manager**

### 2. Navigate to Website Root
- Go to `public_html` folder (or your domain's root directory)
- Clear any existing files if this is a fresh deployment

### 3. Upload Files
- Upload all contents from the `dist` folder
- Upload the `.htaccess` file
- Ensure the file structure looks like:
  ```
  public_html/
  ├── index.html
  ├── .htaccess
  ├── assets/
  │   ├── index-OihFKyb8.js
  │   └── index-tn0RQdqM.css
  └── vite.svg
  ```

### 4. Set Permissions
- Right-click on `.htaccess` → Properties
- Set permissions to `644`
- Ensure `index.html` has `644` permissions

### 5. Configure API URL
Replace `yourdomain.com` in the code with your actual domain:
- Open `public_html/assets/index-OihFKyb8.js`
- Find `https://yourdomain.com` and replace with your actual domain
- Or set up environment variable `VITE_API_URL` in your hosting panel

### 6. Test Your Deployment
- Visit your domain in a browser
- Test all functionality
- Check browser console for any errors

## Backend API Requirements

Your React app expects a backend API with these endpoints:
- `GET /api/health` - Health check
- `GET /api/current-policy-number` - Get current policy number
- `POST /api/reset-policy-number/:number` - Reset policy number
- `POST /api/generate-documents` - Generate documents
- `POST /api/generate-documents-with-custom-order` - Generate custom ordered documents
- `POST /api/split-pdf` - Split PDF files
- `POST /api/debug-generate` - Debug generation

## Troubleshooting

### Common Issues:
1. **404 on refresh** - Ensure `.htaccess` is uploaded and working
2. **API errors** - Check API URL configuration
3. **CORS issues** - Configure your backend to allow your domain
4. **File permissions** - Ensure proper file permissions (644 for files, 755 for folders)

### File Permissions:
- Files: `644`
- Folders: `755`
- `.htaccess`: `644`

## Environment Variables

If your hosting supports environment variables, set:
- `VITE_API_URL=https://yourdomain.com`

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify file uploads are complete
3. Test API endpoints directly
4. Check cPanel error logs
