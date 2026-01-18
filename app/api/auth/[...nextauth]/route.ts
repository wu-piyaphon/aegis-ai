/**
 * Auth.js API Route Handler
 *
 * This file creates the authentication API endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/*
 * - /api/auth/session
 * - etc.
 *
 * Auth.js handles all these routes automatically through the handlers export
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
