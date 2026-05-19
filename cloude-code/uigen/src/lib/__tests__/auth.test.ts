// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

// Neutralize the server-only guard so the module loads in jsdom
vi.mock("server-only", () => ({}));

// Cookie store shared between tests
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

// Import AFTER mocks are registered
const { createSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

const env = process.env as Record<string, string | undefined>;

beforeEach(() => {
  vi.clearAllMocks();
  delete env.NODE_ENV;
});

test("sets the auth-token cookie", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name] = mockCookieStore.set.mock.calls[0];
  expect(name).toBe("auth-token");
});

test("JWT payload contains userId and email", async () => {
  await createSession("user-42", "test@example.com");

  const [, token] = mockCookieStore.set.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("test@example.com");
});

test("JWT payload contains an expiresAt ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, token] = mockCookieStore.set.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(payload.expiresAt as string).getTime();

  expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expiresAt).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("cookie options include httpOnly, sameSite lax, path /", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];

  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie secure is false outside production", async () => {
  env.NODE_ENV = "test";
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.secure).toBe(false);
});

test("cookie secure is true in production", async () => {
  env.NODE_ENV = "production";
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.secure).toBe(true);
});

test("cookie expires ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expires: Date = options.expires;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});
