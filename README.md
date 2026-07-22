# 🛡️ Audit Log Dashboard

A production-ready, full-stack **Audit Log Management Dashboard** for ingesting, searching, filtering, sorting, and visualizing large volumes of system audit logs (bulk uploads of 10,000+ records supported).

Built with **React (Vite)**, **Node.js/Express**, and **MongoDB (Mongoose)**, following clean architecture and MVC principles.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Folder Structure](#-folder-structure)
- [Installation Steps](#-installation-steps)
- [MongoDB Setup](#-mongodb-setup)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [API Documentation](#-api-documentation)
- [Frontend Features / Screenshots](#-frontend-features)
- [Deployment Steps](#-deployment-steps)
- [Future Enhancements](#-future-enhancements)

---

## 🧭 Project Overview

The Audit Log Dashboard allows security/ops teams to:

- Bulk-upload large batches of audit log JSON data.
- Search, filter, sort, and paginate logs entirely on the server side for performance at scale.
- View real-time dashboard statistics (total logs, severity breakdowns, resolution status).
- Export the current view to CSV.
- Toggle dark mode for comfortable extended use.

---

## 🧰 Technology Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React.js (Vite), Bootstrap 5, Axios, react-toastify |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB with Mongoose ODM               |
| Tooling    | Nodemon, Git & GitHub, Eclipse IDE       |
| Deployment | Render (backend), Vercel (frontend), MongoDB Atlas (database) |

---

## 📁 Folder Structure

```
audit-log-dashboard/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── logController.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   ├── models/
│   │   └── Log.js
│   ├── routes/
│   │   └── logRoutes.js
│   ├── utils/
│   │   └── validators.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── UploadLogs.jsx
│   │   │   ├── LogTable.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── DashboardCards.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation Steps

### Prerequisites
- Node.js **v18+**
- npm **v9+**
- MongoDB (local install or a free MongoDB Atlas cluster)
- Git
- Eclipse IDE (with a JavaScript/Node.js runtime configured, or use the built-in terminal)

### Clone the repository

```bash
git clone https://github.com/<your-username>/audit-log-dashboard.git
cd audit-log-dashboard
```

### Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your MongoDB URI
npm run dev
```

The API will start on **http://localhost:5000**.

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # ensure VITE_API_BASE_URL points to your backend
npm run dev
```

The dashboard will be available on **http://localhost:5173**.

> **Eclipse IDE note:** Import both `backend` and `frontend` as separate existing projects (`File → Import → General → Existing Folder as New Project`), then use Eclipse's integrated terminal to run the `npm` commands above inside each folder.

---

## 🗄️ MongoDB Setup

**Option A — Local MongoDB**
1. Install MongoDB Community Server.
2. Start the service: `mongod` (or via your OS service manager).
3. Use `MONGO_URI=mongodb://127.0.0.1:27017/audit_log_dashboard` in `.env`.

**Option B — MongoDB Atlas (recommended for deployment)**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for development).
3. Copy the connection string into `MONGO_URI` in `backend/.env`.

The `logs` collection and all required indexes (`actor`, `role`, `severity`, `status`, `timestamp`, `resourceType`, `region`) are created automatically by Mongoose on first run.

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/audit_log_dashboard
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ▶️ Running the App

| Command                | Location     | Description                       |
|-------------------------|--------------|------------------------------------|
| `npm run dev`           | `backend/`   | Starts Express server with nodemon |
| `npm run dev`           | `frontend/`  | Starts Vite dev server             |
| `npm run build`         | `frontend/`  | Builds production frontend bundle  |
| `npm start`             | `backend/`   | Starts server in production mode   |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### 1. Bulk Upload Logs
```
POST /api/logs/bulk-upload
Content-Type: application/json

Body: [ { actor, role, action, resource, resourceType, ipAddress, region, severity, status, timestamp }, ... ]
```
**Response `201`**
```json
{ "success": true, "inserted": 9998, "duplicates": 2, "invalid": 0, "totalReceived": 10000 }
```

### 2. Fetch Logs (search, filter, sort, paginate)
```
GET /api/logs?search=priya&role=admin&severity=HIGH&status=Unresolved&sortBy=timestamp&order=desc&page=1&limit=20
```
**Response `200`**
```json
{ "page": 1, "limit": 20, "totalPages": 50, "totalRecords": 1000, "data": [ ... ] }
```

Supported query parameters:
| Param          | Description                                            |
|----------------|---------------------------------------------------------|
| `search`       | Regex search across actor, resource, action, ipAddress, region |
| `role`, `severity`, `status`, `region`, `resourceType` | Exact-match filters (comma-separated for multiple values) |
| `sortBy`       | `timestamp` \| `actor` \| `role` \| `severity`          |
| `order`        | `asc` \| `desc`                                         |
| `page`, `limit`| Pagination controls (limit capped at 500)               |

### 3. Get Single Log
```
GET /api/logs/:id
```

### 4. Delete Log
```
DELETE /api/logs/:id
```

### 5. Dashboard Statistics
```
GET /api/logs/stats/summary
```
**Response `200`**
```json
{ "success": true, "data": { "totalLogs": 10000, "highSeverity": 1200, "criticalSeverity": 340, "resolved": 6000, "unresolved": 4000 } }
```

### Standard HTTP Status Codes
| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success                          |
| 201  | Resource created                 |
| 400  | Validation / bad request         |
| 404  | Resource not found                |
| 409  | Duplicate record                  |
| 500  | Internal server error             |

---

## 🎨 Frontend Features

- Responsive Bootstrap 5 table with sticky header, hover states, and alternating row colors.
- Server-side search (500ms debounce), filtering, sorting (click column headers), and pagination.
- Drag-and-drop-friendly JSON bulk upload with live progress bar and toast feedback.
- Live dashboard cards: Total, High Severity, Critical, Resolved, Unresolved.
- CSV export of the current page.
- Dark mode toggle with system-preference detection.
- Empty state and error handling for all data views.

*(Add your own dashboard screenshots here once running locally, e.g. `docs/screenshot-dashboard.png`.)*

---

## 🚀 Deployment Steps

### Backend → Render
1. Push the `backend/` folder to GitHub.
2. Create a new **Web Service** on [Render](https://render.com), pointing to the repo/subfolder.
3. Build command: `npm install` — Start command: `npm start`.
4. Add environment variables (`MONGO_URI`, `CLIENT_URL`, `PORT`) in the Render dashboard.

### Frontend → Vercel
1. Push the `frontend/` folder to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Framework preset: **Vite**.
4. Add `VITE_API_BASE_URL` pointing to your deployed Render backend URL.

### Database → MongoDB Atlas
1. Use the Atlas connection string as `MONGO_URI` on Render.
2. Whitelist Render's outbound IPs (or `0.0.0.0/0` for simplicity).

---

## 🔮 Future Enhancements

- JWT-based authentication & role-based access control.
- Real-time log streaming via WebSockets.
- Advanced analytics dashboard with charts (e.g. Chart.js/Recharts) for trends over time.
- Audit log retention policies & scheduled archival.
- Multi-tenant support for organizations.
- Export to PDF in addition to CSV.

---

## 📄 License

MIT
