# Tasky - Collaborative Task Management Platform

Tasky is a robust, real-time task management application designed for seamless collaboration. It features drag-and-drop task organization, real-time updates via Socket.io, and a secure authentication system.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional, for containerized setup)

### Local Development

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd taskmanger
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_connection_string
    # JWT_SECRET=your_secret_key
    # CLIENT_ORIGIN=http://localhost:3000
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Access the app at `http://localhost:3000`

### Docker Setup (Easier)

For a one-command setup including the database:
```bash
docker-compose up --build
```
This will start:
- Frontend on port `3000`
- Backend on port `5000`
- MongoDB on port `27017`

---

## 📡 API Contract

### Authentication
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user and receive HTTP-only cookie.
- `GET /api/auth/me` - Get current user profile.

### Tasks
- `GET /api/tasks` - Retrieve tasks (supports filters: `status`, `priority`).
- `POST /api/tasks` - Create a new task.
- `GET /api/tasks/:id` - Get specific task details.
- `PUT /api/tasks/:id` - Update task (status, position, details).
- `DELETE /api/tasks/:id` - Delete a task.

---

## 🏗 Architecture Overview & Design Decisions

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Query (TanStack Query), React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB).
- **Real-time**: Socket.io.

### Key Decisions

1.  **Database (MongoDB)**: Chosen for its flexibility with schema-less documents, which fits task data that might evolve (e.g., adding tags, custom fields). Mongoose is used for strict schema validation at the application level.

2.  **Authentication (JWT in Cookie)**: HTTP-only cookies are used for storing JWTs to prevent XSS attacks. The backend issues a cookie upon login, which is automatically sent with subsequent credentials-included requests.

3.  **Service Layer Pattern**: The backend is structured into `Controllers` (HTTP handling), `Services` (Business Logic), and `Repositories` (DB Access). This separation of concerns allows for easier testing and maintenance.

4.  **Optimistic UI Updates**: 
    - Implemented using **React Query's `onMutate`**.
    - When a user moves a task, the UI updates *immediately* before the server confirms.
    - If the server request fails, the UI rolls back to the previous state.
    - This ensures a "buttery smooth" drag-and-drop experience.

5.  **Real-Time Collaboration**:
    - **Socket.io** is used to broadcast events (`task:created`, `task:updated`, `task:deleted`) to all connected clients.
    - React Query's cache is updated instantly upon receiving these events, keeping all users in sync without manual refreshing.

### Audit Logging
A dedicated `AuditLog` model tracks critical actions, specifically status changes. This is implemented in the business logic layer (`TaskService`) to ensure all updates, regardless of source (API, internal), are logged.

---

## ⚖️ Trade-offs & Assumptions

- **Socket Broadcasting**: Currently, socket events are broadcast to *all* users. In a production multi-tenant app, we would use Socket.io "rooms" to scope events to specific organizations or teams.
- **Pagination**: The `GET /api/tasks` endpoint returns all tasks. For large datasets, server-side pagination would be necessary.
- **Drag & Drop Calculation**: Position is calculated using simple arithmetic averages. Over a long period of aggressive reordering, precision issues (floating point limits) could occur. A re-indexing strategy would be needed for a heavy-use production system.
