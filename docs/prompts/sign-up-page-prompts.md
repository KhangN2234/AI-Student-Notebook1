# Sign-Up Page Prompts

## Purpose
Use this file as the prompt set for adding a sign-up page to the current project. It defines the expected behavior, implementation steps, and testing checks for the registration flow.

---

## Project Context

The current app has:
- A React frontend in `frontend/`
- A Node/Express backend in `Backend/`
- Existing pages for notes, folders, dashboard, questions, and login planning
- MongoDB Atlas integration already in place or planned for user data support

The sign-up page should fit into the existing app without breaking the current notes, folders, questions, or login workflow.

---

## Prompt Set Overview

The sign-up feature should:
- Let a new user create an account
- Validate the form on the client side
- Call a backend registration endpoint
- Store the new user securely
- Redirect the user after successful registration
- Show clear errors on failure
- Keep the UI consistent with the rest of the app

If registration is not fully implemented yet, the page should still be structured so it can connect to a backend auth system later.

---

## Prompt 1: Create the Sign-Up Page UI

**Goal:** Build a sign-up page that matches the current app style.

**Prompt:**
Create a new sign-up page in the frontend with:
- Username input
- Email input
- Password input
- Confirm password input
- Sign-up button
- Optional terms checkbox if needed
- Clear error message area
- Link to login if the user already has an account

Make the page responsive and visually consistent with the existing app.

**Success Criteria:**
- User can see a clean sign-up form
- Form works on desktop and mobile
- UI matches the app’s current style language

---

## Prompt 2: Add Sign-Up Form Validation

**Goal:** Prevent invalid account creation requests.

**Prompt:**
Add client-side validation for the sign-up form:
- Require username
- Require email
- Require password
- Require password confirmation
- Ensure password and confirmation match
- Optionally enforce password strength rules
- Show errors before sending the request when fields are invalid
- Prevent duplicate submissions while the sign-up request is in progress

**Success Criteria:**
- Invalid input is blocked before the API request
- Errors are easy to understand
- The sign-up button disables while submitting

---

## Prompt 3: Connect the Sign-Up Page to the Backend

**Goal:** Send registration data to the server.

**Prompt:**
Add a frontend API call for sign-up and connect the form to it.
The registration request should:
- Send username, email, and password
- Handle success and failure responses
- Show a friendly message if the account already exists or the email is taken

If the backend registration endpoint does not exist yet, create a placeholder API structure that can be wired later.

**Success Criteria:**
- Sign-up form sends data to the backend
- Response handling works correctly
- Error messages are displayed clearly

---

## Prompt 4: Create Backend Registration Endpoint

**Goal:** Add server-side account creation.

**Prompt:**
Create an authentication route in the backend such as:
- `POST /api/auth/signup`

The endpoint should:
- Accept registration data
- Validate required fields
- Check for existing users
- Hash passwords before saving
- Return a success response with a token or session payload
- Return a clear error on failure

**Success Criteria:**
- Backend can accept sign-up requests
- Duplicate accounts are rejected properly
- Successful registration returns a usable auth response

---

## Prompt 5: Add User Storage and Password Security

**Goal:** Store user accounts safely.

**Prompt:**
Create or update a user model in MongoDB that stores:
- username
- email
- password hash
- createdAt
- updatedAt

Use a secure hashing library such as bcrypt or a comparable approach.
Do not store plaintext passwords.

**Success Criteria:**
- Users are stored in MongoDB
- Passwords are hashed securely
- Login can verify the stored password hash later

---

## Prompt 6: Add Session or Token Handling

**Goal:** Keep the user authenticated after sign-up.

**Prompt:**
Implement one of the following:
- JWT token storage in memory/local storage/cookie
- Server-side session handling

Choose the approach that best fits the app and keep it consistent with the login flow.

**Success Criteria:**
- New users are signed in or can sign in immediately after registration
- Auth state is available to protected pages
- Logout can be supported later without major changes

---

## Prompt 7: Protect Routes After Registration

**Goal:** Prevent unauthenticated access to protected areas.

**Prompt:**
Add route protection so that users cannot access protected pages without logging in.
If the user is not authenticated:
- Redirect them to the login page
- Keep track of the originally requested page if possible

**Success Criteria:**
- Protected routes are blocked when not logged in
- Registered users can access the app normally after authentication
- Redirect behavior is predictable

---

## Prompt 8: Add Logout Support

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

## Prompt 9: Test the Sign-Up Flow

**Goal:** Validate the full registration experience.

**Prompt:**
Test the sign-up workflow end to end:
- Open sign-up page
- Submit empty form and confirm validation
- Submit invalid email or mismatched passwords and confirm error handling
- Submit duplicate account data and confirm backend rejection
- Submit valid registration data and confirm redirect or auto-login
- Refresh the page and confirm auth persistence if enabled
- Log out and confirm the session ends

**Success Criteria:**
- Sign-up flow works without breaking existing pages
- Errors and success states behave correctly
- Authentication state behaves consistently

---

## Implementation Order

Use this order to keep the feature low-risk:
1. Create the sign-up page UI
2. Add client-side validation
3. Add frontend registration request handling
4. Create backend registration endpoint
5. Add user storage and password hashing
6. Add session/token handling
7. Protect routes
8. Add logout support
9. Test the full flow

---

## Important Constraints

- Do not break the current notes, folders, questions, or login pages
- Keep the sign-up UI consistent with the current app
- Keep backend API responses predictable
- Choose one auth strategy and use it consistently
- Store passwords securely with hashing
- If user accounts are not yet modeled in MongoDB, keep the prompt flexible enough to support that later

---

## Ready-to-Use Agent Prompt

> Build a sign-up page for the current app. Add a clean React registration form, validate inputs, connect it to a backend auth endpoint, store the new user securely in MongoDB, protect authenticated routes, add logout, and verify the flow end to end without breaking the existing notes, folders, questions, or login features.

---

## Notes for Future Expansion

If you want to add any of the following later, the sign-up flow should stay compatible:
- Email verification
- Password reset page
- Role-based access control
- Persistent user profiles
- OAuth sign-up with Google or Microsoft
