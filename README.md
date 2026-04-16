# blogify

A simple Node.js + Express + MongoDB backend for a blogging platform with JWT auth.

## 🚀 Overview

- `src/index.js`: app entry point
- `src/config/db.js`: MongoDB connection using `mongoose` and `MONGO_URI` from env
- `src/models/user.model.js`: `User` schema with username/email/password + slug generation
- `src/models/post.model.js`: `Post` schema with `author` relation to `User`
- `src/controllers/login.controller.js`: register + login with bcrypt and JWT cookie emission
- `src/controllers/posts.controller.js`: CRUD for posts, with authorization checks on delete
- `src/routes/auth.routes.js`: `/register`, `/login`
- `src/routes/posts.routes.js`: `/` (get all), `/:id`, `POST /` (create), `DELETE /:id`
- `src/middleware/auth.middleware.js`: checks `Authorization: Bearer <token>` or `token` cookie
- `src/service/posts.service.js`: filtered/paginated `getAllPosts`, single post lookup, update helper

## 📦 Packages (from `package.json`)

- express
- mongoose
- dotenv
- bcrypt
- jsonwebtoken
- cors
- cookie-parser
- express-validator
- nodemon (dev)

## ⚙️ Setup

1. Clone repository.
2. `cd blogify`
3. `npm install`
4. Create `.env` from `.env.example` (see below).
5. Run `npm run dev` for hot-reload or `npm start` for production.

## 🧩 Environment Variables

Required in `.env`:

- `MONGO_URI` (MongoDB connection string)
- `JWT_SECRET` (secret for signing tokens)

Optional:

- `PORT` (server port, default is 3001 in code)

## ▶️ Start commands

- `npm run dev` -> uses `nodemon src/index.js`
- `npm start` -> runs `node src/index.js`

## 🔐 Auth flow

1. `POST /api/v1/auth/register`
   - body: `{ "username": "x", "email": "x@x.com", "password": "secret" }`
   - returns 201 user data
2. `POST /api/v1/auth/login`
   - body: `{ "email": "x@x.com", "password": "secret" }`
   - returns JWT token and sets `token` cookie

## 📝 Post routes (protected: require token)

Headers:
- `Authorization: Bearer <token>` (recommended) OR cookie `token` set by login

Endpoints:
- `GET /api/v1/posts` - list posts with optional query params:
  - `author=<authorId>`, `sortBy=<field>:asc|desc`, `limit=<n>`, `page=<n>`
- `GET /api/v1/posts/:id` - get post by ID
- `POST /api/v1/posts` - create post
  - body: `{ "title": "...", "content": "...", "author": "<userId>" }`
- `DELETE /api/v1/posts/:id` - delete post (only post author allowed)

## 🧪 Testing in Postman

1. Register and login to get JWT.
2. In Postman, set `Authorization` header to `Bearer <token>` for protected routes.
3. Use `x-www-form-urlencoded` or raw JSON for body payloads.
4. Test `POST /api/v1/posts/test-body` for request payload verification.

## 🛠️ Notes

- `src/routes/index.js` mounts both auth and post router under same path; actual endpoints become:
  - `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/` (posts routes, because routes are registered on same router).
  - `/api/v1/posts/register` etc, if both expressions are hit. Prefer updating to separate route handlers.
- `src/config/db.js` logs `process.env.PORT` but expects `MONGO_URI`.
- If updating to use `PORT` from env, adjust `src/index.js`.
