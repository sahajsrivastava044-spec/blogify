# LLD - Blogify

## 1. Introduction

This document provides the Low-Level Design (LLD) for the Blogify platform. It describes each component, data structure, API contract, and internal flow in detail.

The project is organised as a monorepo with two sub-projects:

- `blogify/` — the backend API (Node.js + Express + MongoDB)
- `blogify/Frontend/` — the frontend SPA (React + Vite)

---

## 2. Backend — Detailed Design

### 2.1 Entry Point — `src/index.js`

This file bootstraps the Express application.

#### Module Loading

The following modules are loaded at the top of the file:

| Module               | Source                         | Purpose                              |
|----------------------|--------------------------------|--------------------------------------|
| `express`            | npm package                    | Web framework                        |
| `cors`               | npm package                    | Cross-origin resource sharing        |
| `cookie-parser`      | npm package                    | Parse cookies from request headers   |
| `connectDB`          | `./config/db`                  | Initialise MongoDB connection        |
| `authRouter`         | `./routes/auth.routes`         | Authentication routes                |
| `postsRouter`        | `./routes/posts.routes`        | Post CRUD routes                     |
| `User`               | `./models/user.model`          | User Mongoose model (used inline)    |

#### Middleware Registration (applied in order)

1. `express.json()` — Parses incoming JSON request bodies and populates `req.body`.
2. `cookieParser()` — Parses cookies attached to `req.headers.cookie` and populates `req.cookies`.
3. `cors()` — Enables CORS with default options (allows all origins).

#### Routes Mounted

| Path              | Router   |
|-------------------|----------|
| `/api/v1/auth`    | `authRouter` |
| `/api/v1/posts`   | `postsRouter` |

#### Inline Route — `POST /api/v1/users`

This is an ad-hoc endpoint (not protected) that creates a user with only `username` and `email`. The password is **not** hashed here. It is retained from earlier development and should be removed or secured before production use.

```
Input:  { username: string, email: string }
Output: 201 Created → { _id, username, email, slug, ...timestamps }
Error:  400/500 → forwarded to error handler
```

#### Centralised Error Handler

A middleware function `errorHandler(err, req, res, next)` handles three known Mongoose error types:

| Error Name / Code | HTTP Status | Response Shape                            |
|--------------------|-------------|-------------------------------------------|
| `CastError`        | 404         | `{ success: false, error: { message: "Resource not found with id of <value>" } }` |
| `11000` (duplicate key) | 400    | `{ success: false, error: { message: "Duplicate field value entered" } }` |
| `ValidationError`  | 400         | `{ success: false, error: { message: [ ...array of messages ] } }` |
| Any other error    | 500         | `{ success: false, error: { message: "Internal Server Error" } }` |

All errors are logged to the console via `console.error(err)`.

#### Server Startup

The server listens on `PORT` (constant `3001` hardcoded in `src/index.js`).

---

### 2.2 Configuration — `src/config/db.js`

```javascript
const connectDB = async () => {
  // reads MONGO_URI from process.env
  // calls mongoose.connect(MONGO_URL)
  // logs the connected host
  // on failure: logs error and calls process.exit(1)
};
```

**Environment variables loaded:** `MONGO_URI`, `JWT_SECRET`, `PORT` (via `require('dotenv').config()`).

**Note:** This file logs `process.env.PORT` to the console before connecting — a debugging remnant.

---

### 2.3 Models

#### 2.3.1 User Model — `src/models/user.model.js`

**Schema: `userSchema`**

| Field      | Type    | Options                          | Notes                              |
|------------|---------|----------------------------------|------------------------------------|
| `username` | String  | `{ required: true, unique: true, trim: true }` | Used to generate `slug` |
| `firstName`| String  | —                                | Optional                           |
| `lastName` | String  | —                                | Optional                           |
| `email`    | String  | `{ required: true, unique: true, trim: true, lowercase: true }` | Used for lookup during login |
| `password` | String  | `{ required: true }`             | Stored as bcrypt hash              |
| `slug`     | String  | —                                | Auto-generated from `username`     |

**Options:** `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`.

**Virtuals:**

- `fullName` — getter that returns `firstName + " " + lastName`, or whichever name part is available.

**Pre-save Hooks (two registered):**

1. `console.log("mongoose pre middleware", this.email)` — runs on every save (debugging).
2. Slug generation — runs only when `username` is modified. Converts the username to lowercase, trims it, removes non-word characters, replaces spaces with hyphens, and collapses multiple hyphens into one.

```
Example: "Gaming Laptop Pro" → "gaming-laptop-pro"
```

**Model export:** `const User = mongoose.model('User', userSchema);`

---

#### 2.3.2 Post Model — `src/models/post.model.js`

**Schema: `postSchema`**

| Field    | Type             | Options                          | Notes                              |
|----------|------------------|----------------------------------|------------------------------------|
| `title`   | String           | `{ required: true, trim: true }` | Blog post title                    |
| `content` | String           | `{ required: true }`             | Blog post body                     |
| `author`  | ObjectId         | `{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }` | Foreign key to User collection |
| `tags`    | [ObjectId]       | `{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }` | Optional array of Tag references (Tag model not yet implemented) |

**Options:** `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`.

**Model export:** `const Post = mongoose.model('Post', postSchema);`

---

### 2.4 Middleware

#### 2.4.1 Auth Middleware — `src/middleware/auth.middleware.js`

**Function:** `protect(req, res, next)` — an Express middleware.

**Purpose:** Protects routes by verifying the JWT token.

**Token Resolution Order:**

1. **Authorization header:** If `req.headers.authorization` exists and starts with `"Bearer "`, extract the token from index 1 of the space-split string.
2. **Cookie fallback:** If no header token, check `req.cookies.token`.
3. **No token:** If neither is found, respond with `401` → `{ success: false, message: "Not authorized, no token provided" }`.

**Token Verification:**

- Calls `jwt.verify(token, process.env.JWT_SECRET)`.
- On success: attaches the decoded payload to `req.user` and calls `next()`.
- On failure (expired/invalid): logs the error to `console.error`, responds with `401` → `{ success: false, message: "Not authorized, token failed" }`.

**Decoded Payload Structure (from login):**

```json
{
  "id": "<user._id>",
  "user": "<username>",
  "iat": 1700000000,
  "exp": 1700003600
}
```

---

### 2.5 Controllers

#### 2.5.1 Auth Controller — `src/controllers/login.controller.js`

**Dependencies:** `dotenv`, `jsonwebtoken`, `../models/user.model`, `bcrypt`.

##### `registerUser(req, res, next)`

1. Destructures `{ username, email, password }` from `req.body`.
2. Calls `User.findOne({ email })` to check if the email is already registered.
3. If user exists → responds `400` → `{ message: "User already registered" }`.
4. If new user:
   - Hashes password: `bcrypt.hash(password, 10)` → 10 salt rounds.
   - Creates document: `User.create({ username, email, password: hashedPassword })`.
   - Responds `201` → `{ message: "user created", data: newUser }`.
5. No explicit try-catch; the `next` parameter is declared but not used in this function. Errors would be passed to Express's default error handler.

##### `loginUser(req, res, next)`

1. Destructures `{ email, password }` from `req.body`.
2. If either is missing → responds `400` → `{ success: false, message: "Please provide both email and password!!" }`.
3. Finds user: `User.findOne({ email })`.
4. If user not found → responds `404` → `{ success: false, message: "User not found" }`.
5. Compares passwords: `bcrypt.compare(password, user.password)`.
6. If password mismatch → responds `401` → `{ success: false, message: "Invalid credentials!" }`.
7. Builds JWT payload: `{ id: user._id, user: user.username }`.
8. Signs token with `JWT_SECRET` and `{ expiresIn: '1h' }`.
9. Defines cookie options:
   - `expires`: 1 hour from now.
   - `httpOnly: true` — prevents JavaScript access (XSS mitigation).
   - `secure`: `true` only if `NODE_ENV === 'production'`.
10. Responds `200` with cookie set and JSON body `{ success: true, data: { token } }`.
11. Wrapped in try-catch; errors are forwarded via `next(error)`.

---

#### 2.5.2 Posts Controller — `src/controllers/posts.controller.js`

**Dependencies:** `express-validator` (`validationResult`), `../models/post.model.js`, `../service/posts.service.js`.

##### `getAllPosts(req, res)`

1. Calls `postService.getAllPosts(req.query)` — passes the full query object.
2. Responds `200` → `{ message: "Posts handled successfully", data: posts }`.
3. **Note:** `validationResult` is imported but never called. No request body validation for GET.

##### `getPostById(req, res)`

1. Extracts `id = req.params.id`.
2. Calls `postService.PostsById(id)`.
3. If post found → logs to console, responds `200` → `{ message: "Post found successfully", data: post }`.
4. If post not found → logs to console, responds `404` → `{ message: "Post not found" }`.

##### `createPost(req, res, next)`

1. Constructs `postData` by spreading `req.body` and overriding `author` with `req.user.id`.
   - **Security:** The author is always taken from the authenticated user, not from the request body.
2. Calls `Post.create(postData)`.
3. On success → responds `201` → `{ success: true, data: newPost }`.
4. Errors forwarded via `next(error)`.

##### `updatePost(req, res, next)`

1. Extracts `id = req.params.id`, `data = req.body`, `currentId = req.user.id`.
2. Fetches post: `Post.findById(id)`.
3. If post not found → responds `404` → `{ success: false, message: "Post not found" }`.
4. Authorization check: compares `post.author.toString()` with `currentId`.
   - If mismatch → responds `403` → `{ success: false, message: "You are not authorized to update this post" }`.
5. If authorized → calls `postService.updateData(id, data)` → `Post.findByIdAndUpdate(id, data, { new: true })`.
6. Responds `200` → `{ success: true, data: postUpdate }`.
7. Errors forwarded via `next(error)`.

##### `deletePost(req, res, next)`

1. Extracts `postId = req.params.id`, `currentId = req.user.id`.
2. Fetches post: `Post.findById(postId)`.
3. If post not found → responds `404` → `{ success: false, message: "Post not found" }`.
4. Authorization check: compares `post.author.toString()` with `currentId`.
   - If mismatch → responds `403` → `{ success: false, message: "You are not authorized to delete this post" }`.
5. If authorized → calls `post.deleteOne()`.
6. Responds `200` → `{ success: true, message: "Post deleted successfully" }`.
7. Errors forwarded via `next(error)`.

**Module exports:** `{ getAllPosts, getPostById, updatePost, createPost, deletePost }`.

---

### 2.6 Services

#### 2.6.1 Post Service — `src/service/posts.service.js`

**Dependencies:** `../models/post.model.js`.

##### `getAllPosts(queryParams)`

1. Extracts from `queryParams`: `author`, `sortBy`, `limit` (default 10), `page` (default 1).
2. Builds a `filter` object: if `author` is provided, sets `filter.author = author`.
3. Builds `sortOptions`:
   - If `sortBy` is provided (format: `field:asc|desc`):
     - Splits on `:` → `[field, order]`.
     - Sets `sortOptions[field] = order === 'desc' ? -1 : 1`.
   - If no `sortBy`: defaults to `{ createdAt: -1 }` (newest first).
4. Calculates pagination:
   - `limitValue = parseInt(limit)`
   - `skipValue = (parseInt(page) - 1) * limitValue`
5. Executes Mongoose query:
   ```
   Post.find(filter).sort(sortOptions).skip(skipValue).limit(limitValue)
   ```
6. Returns the resulting array of posts.

> **Note:** The `.populate('author', 'username')` call is commented out. Posts are returned without author details populated.

##### `createPost(postData)`

1. Calls `Post.create(postData)` then chains `.populate("author")`.
2. Returns the created post with author details populated.
> **Note:** This function is exported but **not used** by the controller — the controller calls `Post.create()` directly instead.

##### `PostsById(postId)`

1. Calls `Post.findById(postId)`.
2. Returns the post (or `null` if not found).
> **Note:** No `.populate()` is called here, so the `author` field remains an ObjectId reference.

##### `updateData(postId, postData)`

1. Calls `Post.findByIdAndUpdate(postId, postData, { new: true })`.
2. Returns the updated document (or `null` if not found).

**Module exports:** `{ createPost, getAllPosts, PostsById, updateData }`.

---

### 2.7 Routes

#### 2.7.1 Auth Routes — `src/routes/auth.routes.js`

| Method | Path       | Controller          | Middleware |
|--------|------------|---------------------|------------|
| POST   | `/register` | `authController.registerUser` | None     |
| POST   | `/login`    | `authController.loginUser`   | None    |

#### 2.7.2 Post Routes — `src/routes/posts.routes.js`

**Dependencies:** `express`, `postController`, `express-validator.body`, `protect` middleware.

**Validation Rules (`registrationRules`):**

```
body('title').notEmpty().withMessage('Title is required')
body('content').notEmpty().withMessage('Content is required')
```

| Method | Path         | Controller           | Middleware              |
|--------|--------------|----------------------|-------------------------|
| GET    | `/`          | `postController.getAllPosts`   | `protect`          |
| GET    | `/:id`       | `postController.getPostById`   | `protect`          |
| POST   | `/`          | `postController.createPost`    | `registrationRules`, `protect` |
| PUT    | `/:id`       | `postController.updatePost`    | `registrationRules`, `protect` |
| DELETE | `/:id`       | `postController.deletePost`    | `protect`          |
| POST   | `/test-body` | Inline handler                 | None (debug)         |

**`/test-body` handler:**
```
Logs req.body to console.
Responds 200 → { status: "success", received: req.body }
```

---

## 3. Frontend — Detailed Design

### 3.1 Entry Point — `src/main.jsx`

```javascript
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Renders the `App` component into the DOM element with id `root`.

---

### 3.2 App Root — `src/App.jsx`

**State:**

| State Variable      | Type             | Initial Value | Purpose                          |
|---------------------|------------------|---------------|----------------------------------|
| `isAuthenticated`   | boolean          | `false`       | Tracks login status              |
| `userId`            | string \| null   | `null`        | Stores the current user's ID     |

**Effect on Mount:**
- Reads `token` and `userId` from `localStorage`.
- If a token exists, sets `isAuthenticated = true` and `userId` from `localStorage`.

**Routes:**

| Path      | Component Rendered                          | Condition                      |
|-----------|---------------------------------------------|--------------------------------|
| `/login`  | `<Login />`                                 | If not authenticated           |
| `/login`  | `<Navigate to="/" />` (redirect)            | If already authenticated       |
| `/register` | `<Register />`                             | If not authenticated           |
| `/register` | `<Navigate to="/" />` (redirect)            | If already authenticated       |
| `/`       | `<Home userId={userId} />`                  | If authenticated               |
| `/`       | `<Navigate to="/login" />` (redirect)       | If not authenticated           |

The `Navbar` component receives `isAuthenticated` and `setIsAuthenticated` for logout functionality.

---

### 3.3 Pages

#### 3.3.1 Login Page — `src/pages/Login.jsx`

**State:**

| State Variable | Purpose          |
|----------------|------------------|
| `email`        | Email input value |
| `password`     | Password input value |

**Flow on submit (`handleLogin`):**

1. Sends `POST http://localhost:3001/api/v1/auth/login` with `{ email, password }` via Axios.
2. On success (HTTP 200):
   - Stores `token` in `localStorage`.
   - Decodes the JWT payload from base64 (manual decode, no library).
   - Extracts `id` from decoded payload and stores `userId` in `localStorage`.
   - Sets `isAuthenticated = true` and `userId`.
   - Shows success toast and navigates to `/`.
3. On error: shows error toast with server message or generic "Login failed".

#### 3.3.2 Register Page — `src/pages/Register.jsx`

**State:** `username`, `email`, `password`.

**Flow on submit (`handleRegister`):**

1. Sends `POST http://localhost:3001/api/v1/auth/register` with `{ username, email, password }`.
2. On HTTP 201: shows success toast and navigates to `/login`.
3. On error: shows error toast with server message or generic "Registration failed".

#### 3.3.3 Home Page — `src/pages/Home.jsx`

**Props:** `userId` (string from parent).

**State:**

| State Variable      | Type             | Purpose                          |
|---------------------|------------------|----------------------------------|
| `posts`             | array            | List of posts to display         |
| `isCreating`        | boolean          | Toggles the create-post form     |
| `title`             | string           | New post title input             |
| `content`           | string           | New post content input           |
| `editingPostId`     | string \| null   | ID of post being edited          |
| `editTitle`         | string           | Edit form title input            |
| `editContent`       | string           | Edit form content input          |

**Functions:**

- **`fetchPosts()`** — GET `/api/v1/posts/` with Bearer token. Sets `posts` from `response.data.data`.
- **`handleCreatePost(e)`** — POST `/api/v1/posts/` with `{ title, content, author: userId }` and Bearer token. On success, resets form state, hides form, and re-fetches posts.
- **`handleDelete(postId)`** — DELETE `/api/v1/posts/${postId}` with Bearer token. On success, optimistically removes the post from local state.
- **`handleEditClick(post)`** — Populates edit form fields with the post's data.
- **`handleUpdatePost(e, postId)`** — PUT `/api/v1/posts/${postId}` with `{ title: editTitle, content: editContent }` and Bearer token. On success, exits edit mode and re-fetches posts.

**Conditional Rendering:**
- Edit/delete buttons are shown only when `((post.author?._id === userId) || (post.author === userId))` matches.
- Empty state message is displayed when `posts.length === 0`.

---

### 3.4 Components

#### 3.4.1 Navbar — `src/components/Navbar.jsx`

**Props:** `isAuthenticated`, `setIsAuthenticated`.

**Behaviour:**
- Always renders a brand link (`🎓 Blogify`) linking to `/`.
- If authenticated: shows a **Logout** button.
  - `handleLogout()` removes `token` and `userId` from `localStorage`, sets `isAuthenticated = false`, shows toast, and navigates to `/login`.
- If not authenticated: shows **Login** and **Register** buttons linking to respective routes.

#### 3.4.2 Background Icons — `src/components/BackgroundIcons.jsx`

**Behaviour:**
- On mount, generates 15 random icons from the set `['📚', '🖋️', '🎓', '👓', '📜', '📖', '📝', '✒️']`.
- Each icon gets a random position (`x`, `y` in viewport units), duration (15–35s), and delay (0–5s).
- Uses Framer Motion to animate each icon with continuous floating motion (vertical bobbing, horizontal drift, and rotation).

---

## 4. Authentication & Authorization Flow (Detailed)

```
Step 1: User registers or logs in via the frontend forms.
Step 2: Backend validates credentials, hashes/checks password with bcrypt.
Step 3: Backend signs a JWT: payload = { id, user }, secret = JWT_SECRET, expiresIn = '1h'.
Step 4: Backend sets JWT as an HTTP-only cookie AND returns it in JSON response.
Step 5: Frontend stores the JWT in localStorage (token) and userId (decoded from JWT).
Step 6: For every subsequent request, frontend sends Authorization: Bearer <token>.
Step 7: Backend auth middleware extracts and verifies the token.
Step 8: If valid, req.user is populated; the route handler proceeds.
Step 9: For post mutations (update/delete), the controller checks post.author === req.user.id.
```

---

## 5. Seed Script — `seed.js`

**Purpose:** Populates MongoDB with test data.

**Steps:**

1. Connects to MongoDB using `MONGO_URI` from `.env`.
2. Clears all existing `User` and `Post` documents.
3. Creates 3 users with pre-hashed passwords (bcrypt, 10 rounds, password: `password123`):
   - ProfessorSmith (`smith@academy.edu`)
   - ScholarJane (`jane@academy.edu`)
   - ResearcherAlex (`alex@academy.edu`)
4. Generates 5000 posts with random authors and topics, with `createdAt` dates spread over the past ~115 days.
5. Inserts posts in batches of 1000.
6. Exits the process after completion.

---

## 6. Error Response Catalogue

| Scenario                              | HTTP Status | Response Body                                              |
|---------------------------------------|-------------|------------------------------------------------------------|
| User already registered               | 400         | `{ message: "User already registered" }`                  |
| Missing email or password on login    | 400         | `{ success: false, message: "Please provide both email and password!!" }` |
| User not found on login               | 404         | `{ success: false, message: "User not found" }`           |
| Invalid password on login             | 401         | `{ success: false, message: "Invalid credentials!" }`     |
| No token provided                     | 401         | `{ success: false, message: "Not authorized, no token provided" }` |
| Invalid/expired token                 | 401         | `{ success: false, message: "Not authorized, token failed" }` |
| Post not found (get by ID)            | 404         | `{ message: "Post not found" }`                           |
| Post not found (update/delete)        | 404         | `{ success: false, message: "Post not found" }`           |
| Unauthorized post update/delete       | 403         | `{ success: false, message: "You are not authorized to ... this post" }` |
| Duplicate database field (e.g., email)| 400         | `{ success: false, error: { message: "Duplicate field value entered" } }` |
| Mongoose CastError (invalid ID)       | 404         | `{ success: false, error: { message: "Resource not found with id of <value>" } }` |
| Mongoose ValidationError              | 400         | `{ success: false, error: { message: [ ...messages ] } }` |
| Unhandled server error                | 500         | `{ success: false, error: { message: "Internal Server Error" } }` |

---

## 7. Environment Configuration

### Required Variables (`.env`)

| Variable      | Used In              | Description                              |
|---------------|----------------------|------------------------------------------|
| `MONGO_URI`   | `src/config/db.js`   | MongoDB connection string (e.g., `mongodb://localhost:27017/blogify`) |
| `JWT_SECRET`  | `src/controllers/login.controller.js`, `src/middleware/auth.middleware.js` | Secret key for signing and verifying JWT tokens |

### Optional Variables

| Variable | Default | Used In           | Description               |
|----------|---------|-------------------|---------------------------|
| `PORT`   | 3001    | `src/index.js` (hardcoded, not read from env) | Server listen port |
| `NODE_ENV` | —     | `src/controllers/login.controller.js` | When set to `"production"`, JWT cookie is marked `secure` |

---

## 8. Development & Operational Notes

- **Development server:** `npm run dev` runs `nodemon src/index.js` for automatic restarts.
- **Production server:** `npm start` runs `node src/index.js`.
- **Seeding:** `node seed.js` must be run manually to populate test data.
- **Frontend dev server:** Run `npm run dev` inside the `Frontend/` directory (default Vite port 5173).
- **Frontend API calls:** Hardcoded to `http://localhost:3001` — not configurable via environment variables.
