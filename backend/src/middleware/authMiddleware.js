import { jwtVerify } from "jose";
import { JWKS } from "../lib/jwks.js";

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const authenticate = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1`,
      audience: "authenticated"
    });

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return response.status(401).json({ error: "Token expired" });
    }
    if (error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      return response.status(401).json({ error: "Invalid token signature" });
    }
    return response.status(401).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuthenticate = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1`,
      audience: "authenticated"
    });

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
};