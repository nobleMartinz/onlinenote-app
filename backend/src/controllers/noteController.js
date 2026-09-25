import pool from "../db.js";

const noteFields = `
  id,
  title,
  content,
  user_id AS "userId",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const validateString = (value, field) => {
  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string`);
  }

  return value;
};

const parseNoteId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Note ID must be a positive integer");
  }

  return id;
};

const getUserId = (request) => {
  if (!request.user?.id) {
    throw new HttpError(401, "User not authenticated");
  }
  return request.user.id;
};

export const createNote = async (request, response, next) => {
  try {
    const userId = getUserId(request);
    const title = validateString(request.body?.title, "title");
    const content = validateString(request.body?.content, "content");
    const { rows } = await pool.query(
      `INSERT INTO notes (title, content, user_id)
       VALUES ($1, $2, $3)
       RETURNING ${noteFields}`,
      [title, content, userId]
    );

    response.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getNotesForUser = async (request, response, next) => {
  try {
    const userId = getUserId(request);
    const { rows } = await pool.query(
      `SELECT ${noteFields}
       FROM notes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    response.json(rows);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (request, response, next) => {
  try {
    const id = parseNoteId(request.params.id);
    const userId = getUserId(request);
    const updates = [];
    const values = [];

    if (request.body.title !== undefined) {
      values.push(validateString(request.body.title, "title"));
      updates.push(`title = $${values.length}`);
    }

    if (request.body.content !== undefined) {
      values.push(validateString(request.body.content, "content"));
      updates.push(`content = $${values.length}`);
    }

    if (updates.length === 0) {
      throw new HttpError(400, "At least one of title or content is required");
    }

    values.push(id, userId);
    const idParameter = `$${values.length - 1}`;
    const userIdParameter = `$${values.length}`;
    const { rows } = await pool.query(
      `UPDATE notes
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = ${idParameter} AND user_id = ${userIdParameter}
       RETURNING ${noteFields}`,
      values
    );

    if (rows.length === 0) {
      throw new HttpError(404, "Note not found");
    }

    response.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (request, response, next) => {
  try {
    const id = parseNoteId(request.params.id);
    const userId = getUserId(request);
    const { rowCount } = await pool.query(
      `DELETE FROM notes
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (rowCount === 0) {
      throw new HttpError(404, "Note not found");
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
