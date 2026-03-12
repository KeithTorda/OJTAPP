# OJT Web App (Command Center Theme)

## Goal

Develop a high-performance, mobile-responsive web application for OJT (On-the-Job Training) logging using a React frontend (based on the provided `stitch` designs) and a PHP/MySQL REST API backend.

## Project Type

**WEB** (React.js + PHP Backend)
Primary Agent: `frontend-specialist` (for UI/React) and `backend-specialist` (for PHP/MySQL)

## Success Criteria

- [ ] Responsive UI faithfully replicating the "Command Center" theme from the `stitch` folder.
- [ ] Simple login system (username/password) to support multiple app users.
- [ ] Persistent CRUD operations saving to a MySQL database via PHP REST API.
- [ ] "Weekly Accomplishment Report" PDF generation using PHP (Dompdf).
- [ ] Smooth state management via React Context API and Axios.

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, lucide-react, Axios
- **Backend:** PHP 8.x (Vanilla REST API with PDO), Dompdf
- **Database/Server:** MySQL, XAMPP (Apache)

## File Structure

```
c:/xampp/htdocs/ojt/
├── api/                  # PHP REST API backend
│   ├── config/           # Database connection
│   ├── models/           # DB schema representations
│   ├── endpoints/        # CRUD endpoints (logs, auth)
│   └── vendor/           # Composer dependencies (Dompdf)
├── src/                  # React Frontend (Vite)
│   ├── components/       # Reusable UI (from stitch design)
│   ├── context/          # State management (Auth & Logs)
│   ├── pages/            # Login, Dashboard, Log Input
│   └── services/         # Axios API calls
├── docs/                 # Documentation and plans
└── stitch/               # Provided UI designs (Command Center, Tactical Dashboard)
```

## Tasks

- [ ] **Task 1: Project Setup (Frontend & Backend)**
  - **Agent:** `orchestrator` & `app-builder`
  - **Action:** Scaffold React.js via Vite in the root (or `client` folder) and initialize Composer (`dompdf/dompdf`) in the `api/` directory.
  - **Verify:** `npm run dev` starts the React app; PHP API folder has `vendor` and basic `index.php`.

- [ ] **Task 2: Database Design & Configuration**
  - **Agent:** `backend-specialist` & `database-design`
  - **Action:** Create MySQL schema for `users` (id, username, password) and `ojt_logs` (id, user_id, task_desc, hours, date, photo_url), then setup `api/config/Database.php` using PDO.
  - **Verify:** Can connect to MySQL and execute a test query via Postman/cURL.

- [ ] **Task 3: Implement Simple Authentication**
  - **Agent:** `backend-specialist` & `frontend-specialist`
  - **Action:** Create PHP API endpoints (`login.php`) for simple username/password auth using sessions or basic token. Build the React `Login.jsx` page and wrap the app in an AuthContext to protect routes.
  - **Verify:** User cannot access dashboard without logging in; login redirects to dashboard.

- [ ] **Task 4: Implement Backend REST API (CRUD)**
  - **Agent:** `backend-specialist` & `api-patterns`
  - **Action:** Create PHP endpoints (`create.php`, `read.php`, `update.php`, `delete.php`) handling JSON requests and associating outputs with the logged-in user.
  - **Verify:** Postman tests confirm CRUD operations on `ojt_logs` table, filtered by user_id.

- [ ] **Task 5: Integrate "Stitch" UI into React Components**
  - **Agent:** `frontend-specialist` & `frontend-design`
  - **Action:** Convert `stitch/.../command_center_log_input/code.html` and `stitch/.../tactical_dashboard/code.html` into React components (`LogInput.jsx`, `Dashboard.jsx`) using Tailwind CSS and `lucide-react`.
  - **Verify:** UI renders in browser exactly matching the `stitch` screenshots and responds well to mobile viewports.

- [ ] **Task 6: Frontend-Backend State & Connectivity**
  - **Agent:** `frontend-specialist`
  - **Action:** Setup Axios interceptors in `src/services/api.js` and React Context for managing global logs state. Connect components to fetch and post data to the PHP API.
  - **Verify:** Submitting a log in the UI saves to the database and immediately updates the Dashboard list.

- [ ] **Task 7: PDF Generation (Dompdf)**
  - **Agent:** `backend-specialist`
  - **Action:** Create `api/endpoints/export_pdf.php` to fetch weekly logs for the logged-in user and render an HTML template into a PDF using Dompdf.
  - **Verify:** Clicking "Export PDF" downloads a properly formatted "Weekly Accomplishment Report" containing the specific user's DB data.

## Done When

- [ ] Users can log in using their username and password.
- [ ] Users can log tasks dynamically under their own account.
- [ ] The tactical dashboard accurately reflects stored MySQL data.
- [ ] The PDF export reliably generates reports.
- [ ] Code passes standard validation (`verify_all.py` or equivalent checklist).

## Phase X: Verification

- [ ] Run `python .agent/scripts/lint_runner.py .`
- [ ] Run `python .agent/scripts/security_scan.py .`
- [ ] Run `npm run build` to check for frontend compilation errors.
- [ ] Manually test UI functionality in Chrome/Brave.
