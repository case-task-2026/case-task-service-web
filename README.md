# Case Task Service Web

Frontend web application for managing caseworker tasks.

This service provides a GOV.UK-style web interface that consumes the Case Task Service API. It allows users to create, view, update, change status, and delete caseworker tasks through an accessible server-rendered web application.

## Project overview

This frontend was built as a companion web application for the Case Task Service API.

The backend API provides task management endpoints. This frontend consumes those endpoints and presents a user-facing interface for managing tasks.

The frontend supports the full task lifecycle:

- View all tasks
- View task details
- Create a task
- Update task details
- Update task status
- Delete a task using a confirmation page

The implementation uses a server-rendered approach with Express, TypeScript, Nunjucks, and GOV.UK Frontend.

## Features

- GOV.UK-style layout and components
- Homepage
- Task list page
- Task details page
- Create task form
- Update task details form
- Update task status form
- Delete confirmation page
- Accessible form validation errors
- Friendly task-not-found states
- Friendly backend-unavailable states
- Global 404 page
- Global service error page
- Typed API client for backend communication
- Unit and route tests using Jest and Supertest
- Name-blind repository metadata

## Technology stack

- Node.js
- TypeScript
- Express
- Nunjucks
- GOV.UK Frontend
- Jest
- Supertest

## Prerequisites

Install:

- Node.js 20 or later
- npm
- Case Task Service API running locally on port `4000`

The frontend runs on port `3000` by default.

## Environment variables

The frontend reads configuration from environment variables.

Create a local `.env` file if you want to override the defaults:

```env
PORT=3000
TASK_API_BASE_URL=http://localhost:4000
```

An example file is included:

```text
.env.example
```

Default values:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port used by the frontend web app |
| `TASK_API_BASE_URL` | `http://localhost:4000` | Base URL of the backend task API |

## Running locally

Install dependencies:

```bash
npm install
```

Start the frontend in development mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Running with the backend API

Start the backend API first.

From the backend project:

```bash
docker compose up -d postgres
./gradlew bootRun
```

The backend should be available at:

```text
http://localhost:4000
```

Then start this frontend project:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/tasks
```

If the backend already contains tasks, they will be shown in the task list.

If the backend contains no tasks, the frontend will show an empty-state message.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server with auto-reload |
| `npm run build` | Compiles TypeScript into `dist` |
| `npm start` | Runs the compiled app from `dist` |
| `npm test` | Runs Jest tests |
| `npm run check` | Runs TypeScript build and tests |

## Frontend routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Homepage |
| `GET` | `/health` | Frontend health check |
| `GET` | `/tasks` | View all tasks |
| `GET` | `/tasks/new` | Create task form |
| `POST` | `/tasks/new` | Submit new task |
| `GET` | `/tasks/:taskId` | View task details |
| `GET` | `/tasks/:taskId/edit` | Edit task details form |
| `POST` | `/tasks/:taskId/edit` | Submit task details update |
| `GET` | `/tasks/:taskId/status` | Update task status form |
| `POST` | `/tasks/:taskId/status` | Submit status update |
| `GET` | `/tasks/:taskId/delete` | Delete confirmation page |
| `POST` | `/tasks/:taskId/delete` | Confirm task deletion |

## Backend API integration

The frontend communicates with the backend through a typed API client.

The API client is configured using:

```text
TASK_API_BASE_URL
```

Default:

```text
http://localhost:4000
```

The frontend consumes these backend endpoints:

| Backend endpoint | Frontend use |
| --- | --- |
| `GET /tasks` | Render task list |
| `POST /tasks` | Create task |
| `GET /tasks/{taskId}` | Render task details, edit form, status form and delete confirmation |
| `PUT /tasks/{taskId}` | Update task details |
| `PATCH /tasks/{taskId}/status` | Update task status |
| `DELETE /tasks/{taskId}` | Delete task |

## User journeys

### View tasks

1. User opens `/tasks`
2. Frontend calls backend `GET /tasks`
3. Backend returns task list
4. Frontend maps tasks into display view models
5. Nunjucks renders the task table

### Create task

1. User opens `/tasks/new`
2. User enters title, optional description, due date and due time
3. Frontend validates the form
4. Frontend converts the form into backend API payload
5. Frontend calls backend `POST /tasks`
6. Backend creates the task
7. Frontend redirects to `/tasks/{createdTaskId}`

### View task details

1. User opens `/tasks/{taskId}`
2. Frontend calls backend `GET /tasks/{taskId}`
3. Backend returns task details
4. Frontend renders status, description, due date, created date and updated date

### Update task details

1. User opens `/tasks/{taskId}/edit`
2. Frontend calls backend `GET /tasks/{taskId}` to pre-populate the form
3. User updates title, description, due date or due time
4. Frontend validates the form
5. Frontend calls backend `PUT /tasks/{taskId}`
6. Frontend redirects back to `/tasks/{taskId}`

### Update task status

1. User opens `/tasks/{taskId}/status`
2. Frontend calls backend `GET /tasks/{taskId}` to pre-select the current status
3. User selects a new status
4. Frontend validates the selection
5. Frontend calls backend `PATCH /tasks/{taskId}/status`
6. Frontend redirects back to `/tasks/{taskId}`

### Delete task

1. User opens `/tasks/{taskId}/delete`
2. Frontend calls backend `GET /tasks/{taskId}` to display the task being deleted
3. User confirms deletion
4. Frontend calls backend `DELETE /tasks/{taskId}`
5. Frontend redirects back to `/tasks`
6. Deleted task no longer appears in the task list

## Validation

The frontend performs validation before submitting form data to the backend.

### Task details validation

- Title is required
- Title must be 120 characters or fewer
- Description must be 1000 characters or fewer
- Due date is required
- Due time is required

### Task status validation

Status must be one of:

- `TODO`
- `IN_PROGRESS`
- `COMPLETED`

The backend remains the source of truth for validation and persistence.

Frontend validation improves user experience, but backend validation still protects the API.

## Date and time handling

The frontend uses separate date and time inputs for usability.

For example:

```text
Due date: 2026-06-12
Due time: 16:30
```

The frontend converts this into an ISO-8601 timestamp before sending it to the backend:

```text
2026-06-12T16:30:00Z
```

For this prototype, submitted date/time values are treated as UTC.

In a production service, the timezone policy should be agreed explicitly with product, design and users.

## Error handling

The frontend handles several error cases.

### Backend unavailable

If the frontend cannot reach the backend API, it renders a friendly error message such as:

```text
The task API could not be reached. Check that the backend service is running.
```

### Task not found

If the backend returns a `404` for a task, the frontend renders a task-not-found page or message.

### Validation errors

Validation errors are rendered using GOV.UK-style error summaries and field-level error messages.

### Unknown frontend route

Unknown routes render a global `Page not found` page.

### Unexpected frontend error

Unexpected frontend errors render a generic service error page.

## Security and hardening

The app disables the default Express `X-Powered-By` header.

It also sets safer default response headers:

| Header | Value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `same-origin` |
| `Cache-Control` | `no-store` |

These are lightweight hardening measures suitable for a prototype frontend.

## Accessibility considerations

The frontend uses GOV.UK Frontend classes and patterns where appropriate.

Implemented accessibility-related considerations include:

- Semantic headings
- Skip link
- GOV.UK-style form labels
- Hint text for form inputs
- Error summaries
- Field-level error messages
- `aria-describedby` links between inputs, hints and errors
- Radio buttons for task status selection
- Warning text on delete confirmation
- Clear back links and cancel links

## Architecture

The frontend is organised around clear responsibilities.

```text
src/app.ts
  Express app setup, middleware, route registration and error handlers

src/config
  Environment configuration

src/routes
  Express route modules

src/tasks
  Task types, API client, form parsing, validation and view models

src/views
  Nunjucks templates

src/views/tasks
  Task-related page templates

src/views/errors
  Global error page templates

src/public
  App-specific static assets

test
  Jest and Supertest test suite
```

## Key implementation decisions

### Server-rendered frontend

The frontend uses Express and Nunjucks rather than a client-side single-page application.

This keeps the implementation simple, accessible, easy to test, and aligned with traditional GOV.UK-style service patterns.

### GOV.UK Frontend

The UI uses GOV.UK Frontend styling and components to create a familiar government-service style.

The implementation serves GOV.UK Frontend assets locally from the installed package.

### Typed API client

The backend API is consumed through a `TaskApiClient` interface.

Routes depend on the interface, not directly on the HTTP implementation.

This allows route tests to inject fake API clients, keeping tests fast and independent of the backend.

### View models

Raw backend task responses are mapped into display-ready view models before rendering.

This keeps formatting logic out of templates and route handlers.

For example:

```text
TODO -> To do
IN_PROGRESS -> In progress
COMPLETED -> Completed
```

Date/time strings are also formatted for display in the view model layer.

### Form model layer

Form parsing, validation and payload conversion live outside the route handlers.

This keeps routes focused on request handling and response rendering.

### Post/Redirect/Get

Successful create, update, status update and delete actions redirect after POST.

This avoids duplicate form submissions when the user refreshes the browser.

### Backend remains source of truth

The frontend performs validation for user experience, but the backend remains responsible for enforcing final validation and persistence rules.

## Testing

Run all checks:

```bash
npm run check
```

This runs:

```bash
npm run build
npm test
```

The test suite covers:

- Homepage route
- Health route
- GOV.UK layout rendering
- API client request construction
- API client structured error handling
- API client connection error handling
- Task list page
- Empty task list state
- Backend unavailable state
- Create task page
- Create task validation
- Create task submission
- Task details page
- Task not found state
- Update task details page
- Update task details validation
- Update task details submission
- Update task status page
- Update task status validation
- Update task status submission
- Delete confirmation page
- Delete submission
- Global 404 page
- Response headers
- Active navigation state

## Manual verification

Start the backend API:

```bash
docker compose up -d postgres
./gradlew bootRun
```

Start the frontend:

```bash
npm run dev
```

Then verify the following manually:

1. Open `http://localhost:3000`
2. Confirm the homepage loads
3. Open `http://localhost:3000/tasks`
4. Confirm the task list loads
5. Create a task from `/tasks/new`
6. Confirm the created task appears in the task list
7. Open the task details page
8. Update the task title, description, due date or due time
9. Confirm the updated task details are shown
10. Update the task status
11. Confirm the updated status is shown
12. Delete the task
13. Confirm the deleted task no longer appears in the task list
14. Open an unknown route such as `/unknown-route`
15. Confirm the global 404 page appears

## Build check

Build the app:

```bash
npm run build
```

Run the compiled app:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Health check

The frontend exposes a health endpoint:

```text
GET /health
```

Example:

```bash
curl -i http://localhost:3000/health
```

Expected response:

```json
{
  "status": "UP"
}
```

## Assumptions

- The backend API is running locally on port `4000`
- The frontend runs locally on port `3000`
- Authentication and authorisation are out of scope
- Pagination and filtering are out of scope
- The service is a prototype implementation for the technical task
- Date/time form values are converted to UTC ISO-8601 strings before submission

## Future improvements

Given more time, the following could be added:

- CSRF protection for form submissions
- Request logging
- Correlation IDs across frontend and backend
- Dockerfile for the frontend
- End-to-end browser tests
- Automated accessibility testing
- Pagination for large task lists
- Filtering by task status
- Sorting controls
- Explicit timezone handling
- Authentication and role-based access control
- Deployment pipeline
- Structured observability and monitoring

## Note

This repository is intended for technical assessment submission.

The project uses neutral naming and does not include personal identifiers in the source code or documentation.