# 🎨 Mujaa Document Generator - Frontend

This is the **frontend application** for the Mujaa Document Generator system.

---

## 🏗️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Fetch API** - HTTP requests to backend

---

## 📦 Repository Structure

This is a **separate Git repository** from the main backend.

### Related Repositories:
- **Frontend (this repo)**: React application
- **Backend**: Node.js/Express API (separate repo)

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Environment Configuration

Create `.env.local` for local development:

```env
VITE_API_URL=http://localhost:3000
```

For production, create `.env.production`:

```env
VITE_API_URL=https://mujaadevelopers.org.ng
```

### Run Development Server
```bash
npm run dev
```

Opens at `http://localhost:5173`

---

## 📤 Build for Production

```bash
npm run build
```

Creates optimized bundle in `dist/` folder.

### Build Output:
- `dist/index.html` - Entry point
- `dist/assets/` - JS, CSS, images

---

## 🌐 Deployment

### cPanel Deployment (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to cPanel:**
   - Upload contents of `dist/` folder to `public_html/`
   - Include `.htaccess` for SPA routing

3. **Configure .htaccess:**
   Already included in `dist/` after build. Ensures React Router works.

### Render/Vercel Deployment

1. Connect this repo to Render/Vercel
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. **Environment Variables:** Set `VITE_API_URL` to your backend URL

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🎯 Features

### Super Admin Dashboard
- 📊 View all pending documents
- 👥 Create and manage staff accounts
- 📄 Generate documents for clients
- 🔑 Manage iLovePDF API keys
- ⚙️ System settings

### Staff Dashboard
- 📄 Generate documents for clients
- 👁️ View indicative PDFs only
- 🔑 Manage personal iLovePDF keys
- 📤 Auto-send combined PDFs to admin

### Document Generation
- 📝 Form-based data entry
- 🏦 Bank-specific document templates
- 📑 Custom document ordering
- 📎 Upload additional documents
- 🔄 PDF splitting and merging
- 💾 Download combined PDF

---

## 🔐 Authentication

Uses JWT tokens stored in `localStorage`:
- Token expires after 24 hours
- Auto-redirect to login on expiry
- Role-based access control (Super Admin, Staff)

---

## 📡 API Integration

The frontend communicates with the backend API:

**Base URL:** Set via `VITE_API_URL` environment variable

**Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register staff (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/generate-documents` - Generate documents
- `GET /api/ilp/my-config` - Get user's iLovePDF settings
- `POST /api/ilp/my-config` - Save iLovePDF keys

---

## 🎨 UI Components

### Main Components:
- `App.jsx` - Main app component, routing, auth
- `UserManagement.jsx` - Admin user management
- `AdminDashboard.jsx` - Admin dashboard (deprecated, now inline)
- `Login` - Login form (inline component)

### Key Features:
- Responsive design
- Real-time credit display
- Form validation
- Error handling with user feedback
- Loading states
- PDF preview

---

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check `VITE_API_URL` is correct
- Ensure backend is running
- Check CORS settings on backend

### "Invalid token" errors
- Token may be expired, logout and login again
- Check JWT_SECRET matches backend

### Documents not generating
- Verify iLovePDF keys are saved
- Check iLovePDF credit balance
- View browser console for errors

### Build failures
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## 📝 Notes

- This is a **Single Page Application (SPA)** - all routing is client-side
- The `.htaccess` file is essential for SPA routing on Apache servers
- Environment variables must be prefixed with `VITE_` to be available in the app
- Build output is optimized and minified for production

---

## 🔗 Backend Repository

For backend setup and API documentation, see the main Mujaa backend repository.

---

## 📄 License

Proprietary - Mujaa Developers

---

**Last Updated:** October 2025
