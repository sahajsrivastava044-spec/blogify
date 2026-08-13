# PRD - Blogify

## 1. Purpose

This document defines the product requirements for **Blogify**, a blogging platform that allows users to register, log in, and create, read, update, and delete blog posts.

---

## 2. Goals & Objectives

| Goal | Description |
|------|-------------|
| User Management | Users can register for an account and log in securely. |
| Content Management | Authenticated users can create, edit, and delete their own blog posts. |
| Content Discovery | All authenticated users can browse and search through published posts. |

---

## 3. User Stories

- **As a new user:** I want to register an account so that I can start creating posts.
- **As a registered user:** I want to log in so that I can access my account and create posts.
- **As an authenticated user:** I want to create a new blog post with a title and content so that I can share my thoughts.
- **As an authenticated user:** I want to see a list of all posts so that I can read what others have published.
- **As an authenticated user:** I want to view a single post so that I can read it in detail.
- **As a post author:** I want to edit my post so that I can correct mistakes or update information.
- **As a post author:** I want to delete my post so that I can remove it when it is no longer needed.
- **As a user:** I want to log out so that my account is secured when I am done.

---

## 4. Scope

### In Scope

- User registration and login (JWT-based authentication)
- Post listing with pagination, sorting, and author filtering
- Single post view by ID
- Post creation
- Post editing (author only)
- Post deletion (author only)
- JWT token stored in HTTP-only cookie and returned in response body

### Out of Scope

- Password reset or email verification
- Post search by keyword
- Post tagging or categorization
- Rich text editor for post content
- User profile editing
- Role-based access control (beyond author ownership)
- File uploads or media attachments

---

## 5. Functional Requirements

### 5.1 Authentication

| ID | Requirement |
|----|-------------|
| AUTH-01 | Users can register with a unique username, email, and password. |
| AUTH-02 | Passwords are hashed with bcrypt before storage. |
| AUTH-03 | Users can log in with their email and password. |
| AUTH-04 | A JWT token is issued on successful login with a 1-hour expiry. |
| AUTH-05 | The JWT token is set as an HTTP-only cookie. |
| AUTH-06 | Protected endpoints require a valid JWT token in the `Authorization` header or cookie. |

### 5.2 Post Management

| ID | Requirement |
|----|-------------|
| POST-01 | Authenticated users can create a post with a title and content. |
| POST-02 | The author of a new post is automatically set from the authenticated user. |
| POST-03 | A list of all posts is available with pagination, sorting, and author filtering. |
| POST-04 | A single post can be retrieved by its ID. |
| POST-05 | Only the post author can edit their own post. |
| POST-06 | Only the post author can delete their own post. |
| POST-07 | Attempting to edit or delete another user's post returns a 403 error. |

### 5.3 API Constraints

| ID | Requirement |
|----|-------------|
| API-01 | All protected endpoints return 401 if no valid token is provided. |
| API-02 | Duplicate email or username registration returns 400. |
| API-03 | Requests to non-existent posts return 404. |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Post listings support pagination to limit response size. |
| Security | Passwords are never stored in plain text. |
| Security | JWT tokens expire after 1 hour. |
| Security | JWT cookies are HTTP-only to mitigate XSS attacks. |
| Reliability | Duplicate field entries (email, username) are rejected by the database. |
| Maintainability | Code is organized into models, controllers, services, and routes layers. |

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| User registration | New users can register and receive confirmation. |
| Login | Registered users can log in and receive a valid JWT token. |
| Post creation | Authenticated users can create posts that appear in the post list. |
| Post editing | Authors can edit their posts; non-authors receive 403. |
| Post deletion | Authors can delete their posts; non-authors receive 403. |
| Post listing | Posts are returned with correct pagination and sorting. |
