# Task Management API

## Introduction

This is my Task Management API project. I made it using Express.js and PostgreSQL. It helps users manage projects and tasks.

## Technologies Used

* Node.js
* Express.js
* PostgreSQL
* Postman
* bcrypt

## Main Features

* Add, view, update, and delete users.
* Add, view, update, and delete projects.
* Add, view, update, and delete tasks.
* Register a new user with a password.
* Check user email and password during login.
* Search tasks by title and filter them by status.
* View task details with user and project names.
* View total, completed, and pending task counts.
* Get tasks in pages and sort them.
* Find overdue tasks.
* Check required fields and handle errors.

## Database Tables

I created three tables in PostgreSQL:

* **Users:** Stores user name, email, and password.
* **Projects:** Stores project name, description, and user ID.
* **Tasks:** Stores task title, description, status, due date, user ID, and project ID.

## How to Run the Project

1. Install Node.js and PostgreSQL.
2. Open the project folder in VS Code.
3. Install the required packages using `npm install`.
4. Create a database named `task_management_db`.
5. Create the required tables in PostgreSQL.
6. Add your database settings to the `.env` file.
7. Start the server using `node app.js`.
8. Use Postman to test the API requests.

## API Routes

### Users

* `GET /users` – View all users.
* `POST /users` – Register a new user.
* `PUT /users/:id` – Update a user.
* `DELETE /users/:id` – Delete a user.

### Projects

* `GET /projects` – View all projects.
* `POST /projects` – Add a project.
* `PUT /projects/:id` – Update a project.
* `DELETE /projects/:id` – Delete a project.

### Tasks

* `GET /tasks` – View all tasks.
* `POST /tasks` – Add a task.
* `PUT /tasks/:id` – Update a task.
* `DELETE /tasks/:id` – Delete a task.
* `GET /tasks-details` – View tasks with user and project names.
* `GET /tasks-search` – Search and filter tasks.
* `GET /tasks-list` – View tasks with pagination and sorting.
* `GET /tasks-overdue` – View overdue, incomplete tasks.
* `GET /dashboard` – View task statistics.

### Authentication

* `POST /login` – Check user email and password.

## Testing

I tested the API routes using Postman and checked that the data was saved and retrieved from PostgreSQL.

## Conclusion

This project helped me practise Express.js, PostgreSQL, CRUD operations, database relationships, and basic login functionality.
