import express from "express";
import pool from "./db.js";
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());
``

app.get("/", (req, res) => {
  res.send("Task Management API is running!");
})

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users"
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch users"
    });
  }
});



app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [cleanName, cleanEmail, hashedPassword]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    res.status(500).json({
      error: "Failed to register user"
    });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, password = $3
       WHERE id = $4
       RETURNING id, name, email`,
      [name, email, hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    res.status(500).json({
      error: "Failed to update user"
    });
  }
});


app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [id]
    );

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});



app.post("/projects", async (req, res) => {
  try {
    const { name, description, user_id } = req.body || {};

    if (!name || !name.trim() || !user_id) {
      return res.status(400).json({
        error: "Project name and user_id are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), description || "", user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create project"
    });
  }
});


app.put("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Project name is required"
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), description || "", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to update project"
    });
  }
});

app.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "DELETE FROM projects WHERE id = $1",
      [id]
    );

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});


app.get("/tasks", async (req, res) => {

  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }

});



app.post("/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      due_date,
      user_id,
      project_id
    } = req.body || {};

    // Required fields validation
    if (!title || !title.trim() || !user_id || !project_id) {
      return res.status(400).json({
        error: "Task title, user_id and project_id are required"
      });
    }

    // Status validation
    const allowedStatuses = ["pending", "completed"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be pending or completed"
      });
    }

    // Insert task into database
    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, status, due_date, user_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        description || "",
        status || "pending",
        due_date || null,
        user_id,
        project_id
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid user_id or project_id"
      });
    }

    res.status(500).json({
      error: "Failed to create task"
    });
  }
});


app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      due_date,
      user_id,
      project_id
    } = req.body || {};

    if (!title || !title.trim() || !user_id || !project_id) {
      return res.status(400).json({
        error: "Task title, user_id and project_id are required"
      });
    }

    const allowedStatuses = ["pending", "completed"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be pending or completed"
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3,
           due_date = $4, user_id = $5, project_id = $6
       WHERE id = $7
       RETURNING *`,
      [
        title.trim(),
        description || "",
        status || "pending",
        due_date || null,
        user_id,
        project_id,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid user_id or project_id"
      });
    }

    res.status(500).json({
      error: "Failed to update task"
    });
  }
});


app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});



app.get("/tasks-details", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
                tasks.id,
                tasks.title,
                tasks.status,
                users.name AS user_name,
                projects.name AS project_name
             FROM tasks
             JOIN users ON tasks.user_id = users.id
             JOIN projects ON tasks.project_id = projects.id`
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch task details" });
  }
});



app.get("/tasks-search", async (req, res) => {
  try {
    const { status, search } = req.query;

    const allowedStatuses = ["pending", "completed"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be pending or completed"
      });
    }

    let query = `
      SELECT id, title, description, status, due_date
      FROM tasks
      WHERE 1=1
    `;

    const values = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to search tasks"
    });
  }
});



app.get("/dashboard", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                COUNT(*) AS total_tasks,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending_tasks
            FROM tasks
        `);

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});



app.get("/tasks-list", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 2);
    const sortInput = (req.query.sort || "desc").toLowerCase();

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        error: "Page must be at least 1 and limit must be between 1 and 100"
      });
    }

    if (!["asc", "desc"].includes(sortInput)) {
      return res.status(400).json({
        error: "Sort must be asc or desc"
      });
    }

    const sort = sortInput.toUpperCase();
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM tasks
       ORDER BY id ${sort}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      page,
      limit,
      sort: sortInput,
      tasks: result.rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch tasks list"
    });
  }
});




app.get("/tasks-overdue", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM tasks
      WHERE due_date < CURRENT_DATE
        AND (status IS NULL OR status != 'completed')
      ORDER BY due_date ASC
    `);

    res.json({
      count: result.rows.length,
      tasks: result.rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch overdue tasks"
    });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});                                           