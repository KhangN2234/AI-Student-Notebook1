# Login Page Prompts

## Purpose
Use this file as the prompt set for adding a login page to the current project. It defines the expected behavior, implementation steps, and testing checks for the login flow.

---

## Project Context

The current app has:
- A React frontend in `frontend/`
- A Node/Express backend in `Backend/`
- Existing pages for notes, folders, dashboard, and questions
- MongoDB Atlas integration already in progress or completed

The login page should fit into the existing app without breaking the current notes, folders, or questions workflow.

---

## Prompt Set Overview

The login feature should:
- Let a user enter credentials
- Validate the form on the client side
- Call a backend login endpoint
- Store the authenticated session or token
- Redirect the user after successful login
- Show clear errors on failure
- Keep the UI consistent with the rest of the app

If authentication is not fully implemented yet, the login page should still be structured so it can connect to a backend auth system later.

---

## Prompt 1: Create the Login Page UI

**Goal:** Build a login page that matches the current app style.

**Prompt:**
Create a new login page in the frontend with:
- Email or username input
- Password input
- Login button
- Optional "Remember me" checkbox
- Clear error message area
- Link to sign up or forgot password if needed later

Make the page responsive and visually consistent with the existing app.

**Success Criteria:**
- User can see a clean login form
- Form works on desktop and mobile
- UI matches the app’s current style language

---

## Prompt 2: Add Login Form Validation

**Goal:** Prevent empty or invalid submissions.

**Prompt:**
Add client-side validation for the login form:
- Require email/username
- Require password
- Show errors before sending the request when fields are empty
- Prevent duplicate submissions while the login request is in progress

**Success Criteria:**
- Invalid input is blocked before the API request
- Errors are easy to understand
- The login button disables while submitting

---

## Prompt 3: Connect the Login Page to the Backend

**Goal:** Send login data to the server.

**Prompt:**
Add a frontend API call for login and connect the form to it.
The login request should:
- Send the username/email and password
- Handle success and failure responses
- Show a friendly message if credentials are wrong

If the backend auth endpoint does not exist yet, create a placeholder API structure that can be wired later.

**Success Criteria:**
- Login form sends data to the backend
- Response handling works correctly
- Error messages are displayed clearly

---

## Prompt 4: Create Backend Auth Endpoint

**Goal:** Add server-side login handling.

**Prompt:**
Create an authentication route in the backend such as:
- `POST /api/auth/login`

The endpoint should:
- Accept login credentials
- Validate required fields
- Check credentials against the user data source
- Return a success response with a token or session payload
- Return a clear error on failure

**Success Criteria:**
- Backend can accept login requests
- Invalid credentials are rejected properly
- Successful login returns a usable auth response

---

## Prompt 5: Add Session or Token Handling

**Goal:** Keep the user logged in after success.

**Prompt:**
Implement one of the following:
- JWT token storage in memory/local storage/cookie
- Server-side session handling

Choose the approach that best fits the app and keep it consistent across the frontend and backend.

**Success Criteria:**
- Login state persists after refresh if intended
- Auth state is available to protected pages
- Logout can be supported later without major changes

---

## Prompt 6: Protect Routes After Login

**Goal:** Prevent unauthenticated access to protected areas.

**Prompt:**
Add route protection so that users cannot access protected pages without logging in.
If the user is not authenticated:
- Redirect them to the login page
- Keep track of the originally requested page if possible

**Success Criteria:**
- Protected routes are blocked when not logged in
- Logged-in users can access the app normally
- Redirect behavior is predictable

---

## Prompt 7: Add Logout Support

**Goal:** Let the user end their session.

**Prompt:**
Add a logout action that:
- Clears auth state
- Removes any stored token or session data
- Redirects the user to the login page

**Success Criteria:**
- Logout fully removes access
- User is returned to the login screen
- Session data does not remain active after logout

---

## Prompt 8: Test the Login Flow

**Goal:** Validate the full login experience.

**Prompt:**
Test the login workflow end to end:
- Open login page
- Submit empty form and confirm validation
- Submit invalid credentials and confirm error handling
- Submit valid credentials and confirm redirect
- Refresh the page and confirm auth persistence if enabled
- Log out and confirm the session ends

**Success Criteria:**
- Login flow works without breaking existing pages
- Errors and success states behave correctly
- Authentication state behaves consistently

---

## Implementation Order

Use this order to keep the feature low-risk:
1. Create the login page UI
2. Add client-side validation
3. Add frontend login request handling
4. Create backend auth endpoint
5. Add session/token handling
6. Protect routes
7. Add logout support
8. Test the full flow

---

## Important Constraints

- Do not break the current notes, folders, or questions pages
- Keep the login UI consistent with the current app
- Keep backend API responses predictable
- Choose one auth strategy and use it consistently
- If users are not yet stored in MongoDB, keep the login prompt flexible enough to support that later

---

## Ready-to-Use Agent Prompt

> Build a login page for the current app. Add a clean React login form, validate inputs, connect it to a backend auth endpoint, store login state, protect authenticated routes, add logout, and verify the flow end to end without breaking the existing notes, folders, or questions features.

---

## Notes for Future Expansion

If you want to add any of the following later, the login flow should stay compatible:
- Sign up / registration page
- Password reset page
- Role-based access control
- Persistent user profiles
- OAuth login with Google or Microsoft
