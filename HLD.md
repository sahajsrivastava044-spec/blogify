# HLD - Blogify

## 1. Overview

**Blogify** is a blogging platform that lets users register, log in, and create, read, update, and delete blog posts. The project is divided into two parts:

- **Backend (API):** A REST API built with Node.js, Express, and MongoDB (via Mongoose).
- **Frontend (UI):** A React single-page application built with Vite and styled with CSS custom properties.

---

## 2. Architecture

The project follows a **layered (MVC-style) architecture** on the backend and a **component-based architecture** on the frontend.

```
+-------------------+        HTTP / JSON        +-------------------+
|    Frontend       |  <---------------------->   |   Backend API     |
|  (React + Vite)   |                            |  (Node + Express) |
+-------------------+                            +-------------------+
                                                          |
                                                          | Mongoose
                                                          v
                                                   +-------------------+
                                                   |   MongoDB         |
                                                   |  (data store)     |
                                                   +-------------------+
```

### Backend Layers

| Layer        | Folder       | Responsibility                                      |
|--------------|--------------|----------------------------------------------------|
| Entry Point  | `src/index.js` | Creates the Express app, applies middleware, mounts routers, starts the server |
| Config       | `src/config/`    | Database connection setup                          |
| Models       | `src/models/`    | Defines Mongoose schemas and data structures     |
| Controllers  | `src/controllers/` | Handles incoming requests and sends responses   |
| Middleware   | `src/middleware/` | Authentication and request validation           |
| Services     | `src/service/`   | Business logic (query building, data operations) |
| Routes       | `src/routes/`    | Maps URLs to controllers and applies middleware  |

### Frontend Structure

| Layer        | Folder       | Responsibility                                      |
|--------------|--------------|----------------------------------------------------|
| Entry Point  | `src/main.jsx` | Mounts the React app into the DOM                  |
| App Root     | `src/App.jsx`  | Defines routes and global auth state               |
| Pages        | `src/pages/`   | Login, Register, and Home (post list) views        |
| Components   | `src/components/` | Navbar and background animation                 |

---

## 3. Technology Stack

| Category         | Technology                |
|------------------|---------------------------|
| Runtime          | Node.js                   |
| Web Framework    | Express.js                |
| Database         | MongoDB (via Mongoose)    |
| Authentication   | JSON Web Tokens (JWT) + bcrypt |
| Password Hashing | bcrypt (10 rounds)        |
| CORS             | cors                      |
| Cookie Parsing   | cookie-parser             |
| Validation       | express-validator         |
| Environment      | dotenv                    |
| Frontend Framework | React 19                  |
| Frontend Build   | Vite                      |
| HTTP Client (Frontend) | Axios               |
| Animation (Frontend) | Framer Motion          |
| Toast Notifications | react-hot-toast         |
| Routing (Frontend) | React Router DOM        |

---

## 4. High-Level Components

### 4.1 Backend Components

1. **Application Server (Express)**
   - Listens on port 3001 (configurable via `PORT`).
   - Parses JSON bodies (`express.json()`) and cookies (`cookie-parser`).
   - Enables CORS for all origins.
   - Centralised error handler for database and validation errors.

2. **Database Connection (`config/db.js`)**
   - Connects to MongoDB using the `MONGO_URI` environment variable.
   - Uses Mongoose's connection pooling internally.

3. **Authentication System**
   - **Register:** Creates a new user with a hashed password.
   - **Login:** Verifies credentials, issues a JWT token, and sets it as an HTTP-only cookie.

4. **Post Management**
   - Full CRUD operations for blog posts.
   - Posts are linked to a user (author) via a Mongoose ObjectId reference.
   - The author field is automatically set from the authenticated user's ID during post creation.

5. **Authorization Middleware (`auth.middleware.js`)**
   - Protects routes by verifying the JWT token from either the `Authorization` header or a cookie.
   - Attaches the decoded user payload to `req.user` for downstream handlers.

6. **Post Service (`service/posts.service.js`)**
   - Encapsulates query logic for listing posts with filtering, sorting, and pagination.
   - Handles single-post lookups and updates.

### 4.2 Frontend Components

1. **App (`App.jsx`)**
   - Uses React Router for client-side routing.
   - Manages authentication state (isAuthenticated, userId) in component state, persisted in `localStorage`.
   - Protects the Home route: unauthenticated users are redirected to `/login`.

2. **Pages**
   - **Login:** Form to enter email and password. Stores the JWT token and decoded user ID in `localStorage`.
   - **Register:** Form to create a new account.
   - **Home:** Displays a list of posts. Logged-in users can create, edit, and delete posts. Shows edit/delete buttons only for posts owned by the current user.

3. **Navbar**
   - Shows login/register buttons or a logout button depending on auth state.

4. **Background Icons**
   - Animated decorative background using Framer Motion.

---

## 5. API Endpoints

### Auth API (`/api/v1/auth`)

| Method | Endpoint    | Description                          | Auth Required |
|--------|-------------|--------------------------------------|---------------|
| POST   | `/register` | Register a new user                  | No            |
| POST   | `/login`    | Log in and receive JWT token         | No            |

### Posts API (`/api/v1/posts`)

| Method | Endpoint     | Description                              | Auth Required |
|--------|--------------|------------------------------------------|---------------|
| GET    | `/`          | List all posts (with optional filters)   | Yes           |
| GET    | `/:id`       | Get a single post by ID                  | Yes           |
| POST   | `/`          | Create a new post                        | Yes           |
| PUT    | `/:id`       | Update a post (author only)              | Yes           |
| DELETE | `/:id`       | Delete a post (author only)              | Yes           |
| POST   | `/test-body` | Debug endpoint to inspect request body   | No            |

### Query Parameters (for `GET /posts`)

| Parameter | Type   | Default | Description                                  |
|-----------|--------|---------|----------------------------------------------|
| `author`  | String | None    | Filter posts by author ID                    |
| `sortBy`  | String | None    | Sort by field and direction (`field:asc` or `field:desc`) |
| `limit`   | Number | 10      | Number of posts per page                     |
| `page`    | Number | 1       | Page number for pagination                   |

---

## 6. Data Flow

### Registration Flow

1. Frontend sends `POST /api/v1/auth/register` with username, email, and password.
2. Backend hashes the password with bcrypt (10 rounds).
3. Backend creates a new `User` document in MongoDB.
4. Response returns `{ message, data: newUser }`.

### Login Flow

1. Frontend sends `POST /api/v1/auth/login` with email and password.
2. Backend finds the user by email.
3. Backend compares the provided password with the stored hash using `bcrypt.compare()`.
4. Backend signs a JWT payload `{ id, user }` with `JWT_SECRET` and a 1-hour expiry.
5. Backend sets the token as an HTTP-only cookie and returns it in the JSON response.
6. Frontend stores the token and decoded user ID in `localStorage`.

### Post Creation Flow

1. Authenticated frontend sends `POST /api/v1/posts` with title and content.
2. Auth middleware verifies the JWT and sets `req.user`.
3. Controller sets `author` from `req.user.id` (ignoring any client-supplied author).
4. Mongoose creates and saves the post.
5. Response returns `{ success, data: newPost }`.

### Post Listing Flow

1. Authenticated request hits `GET /api/v1/posts` with optional query parameters.
2. Auth middleware verifies the token.
3. Controller delegates to `postService.getAllPosts()`.
4. Service builds a Mongoose query with filtering (`author`), sorting (`sortBy`), and pagination (`limit`, `page`).
5. Mongoose returns matching posts.
6. Controller sends `{ message, data: posts }`.

---

## 7. Database Design (High Level)

### User Collection

| Field      | Type     | Constraints              |
|------------|----------|--------------------------|
| _id        | ObjectId | Auto-generated (PK)      |
| username   | String   | Required, unique         |
| email      | String   | Required, unique, lowercase |
| password   | String   | Required (hashed)        |
| firstName  | String   | Optional                 |
| lastName   | String   | Optional                 |
| slug       | String   | Auto-generated from username |
| createdAt  | Date     | Auto (timestamps)        |
| updatedAt  | Date     | Auto (timestamps)        |

### Post Collection

| Field     | Type     | Constraints                        |
|-----------|----------|------------------------------------|
| _id       | ObjectId | Auto-generated (PK)                |
| title     | String   | Required, trimmed                  |
| content   | String   | Required                           |
| author    | ObjectId | Required, references `User._id`    |
| tags      | [ObjectId] | Optional, references `Tag` model |
| createdAt | Date     | Auto (timestamps)                  |
| updatedAt | Date     | Auto (timestamps)                  |

---

## 8. Security Considerations

- **Password Hashing:** Passwords are hashed with bcrypt before storage.
- **JWT Tokens:** Tokens expire after 1 hour and are stored in an HTTP-only cookie to reduce XSS risk.
- **Authorization Checks:** Post update and delete operations verify that the requesting user is the post's author.
- **Validation:** Request bodies are validated with `express-validator` (title and content must be non-empty for posts).

---

## 9. Configuration

The backend reads the following environment variables from a `.env` file:

| Variable      | Required | Description                       |
|---------------|----------|-----------------------------------|
| `MONGO_URI`   | Yes      | MongoDB connection string         |
| `JWT_SECRET`  | Yes      | Secret key for signing JWT tokens |
| `PORT`        | No       | Server port (default: 3001)       |

---

## 10. Development Workflow

- **Backend dev server:** `npm run dev` (runs with `nodemon` for hot reload)
- **Backend production:** `npm start` (runs `node src/index.js`)
- **Frontend dev server:** `npm run dev` inside the `Frontend/` directory
- **Frontend production build:** `npm run build` inside the `Frontend/` directory
- **Seed script:** `node seed.js` populates the database with 3 users and 5000 sample posts
