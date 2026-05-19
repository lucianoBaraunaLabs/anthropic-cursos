import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

function renderBadge(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result",
  result?: unknown
) {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName, args, state, result }}
    />
  );
}

// str_replace_editor — create
test("shows 'Creating' when str_replace_editor create is pending", () => {
  renderBadge("str_replace_editor", { command: "create", path: "src/App.jsx" }, "call");
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Created' when str_replace_editor create is done", () => {
  renderBadge("str_replace_editor", { command: "create", path: "src/App.jsx" }, "result", "ok");
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

// str_replace_editor — str_replace
test("shows 'Editing' when str_replace_editor str_replace is pending", () => {
  renderBadge("str_replace_editor", { command: "str_replace", path: "src/Card.jsx" }, "call");
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows 'Edited' when str_replace_editor str_replace is done", () => {
  renderBadge("str_replace_editor", { command: "str_replace", path: "src/Card.jsx" }, "result", "ok");
  expect(screen.getByText("Edited Card.jsx")).toBeDefined();
});

// str_replace_editor — insert
test("shows 'Editing' for insert command", () => {
  renderBadge("str_replace_editor", { command: "insert", path: "src/index.ts" }, "call");
  expect(screen.getByText("Editing index.ts")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading' when str_replace_editor view is pending", () => {
  renderBadge("str_replace_editor", { command: "view", path: "src/index.ts" }, "call");
  expect(screen.getByText("Reading index.ts")).toBeDefined();
});

test("shows 'Read' when str_replace_editor view is done", () => {
  renderBadge("str_replace_editor", { command: "view", path: "src/index.ts" }, "result", "ok");
  expect(screen.getByText("Read index.ts")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming' when file_manager rename is pending", () => {
  renderBadge("file_manager", { command: "rename", path: "src/Button.jsx" }, "call");
  expect(screen.getByText("Renaming Button.jsx")).toBeDefined();
});

test("shows 'Renamed' when file_manager rename is done", () => {
  renderBadge("file_manager", { command: "rename", path: "src/Button.jsx" }, "result", "ok");
  expect(screen.getByText("Renamed Button.jsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting' when file_manager delete is pending", () => {
  renderBadge("file_manager", { command: "delete", path: "src/OldFile.jsx" }, "call");
  expect(screen.getByText("Deleting OldFile.jsx")).toBeDefined();
});

test("shows 'Deleted' when file_manager delete is done", () => {
  renderBadge("file_manager", { command: "delete", path: "src/OldFile.jsx" }, "result", "ok");
  expect(screen.getByText("Deleted OldFile.jsx")).toBeDefined();
});

// Unknown tool
test("shows 'Running toolName' for unknown tool pending", () => {
  renderBadge("unknown_tool", {}, "call");
  expect(screen.getByText("Running unknown_tool")).toBeDefined();
});

test("shows 'Ran toolName' for unknown tool done", () => {
  renderBadge("unknown_tool", {}, "result", "ok");
  expect(screen.getByText("Ran unknown_tool")).toBeDefined();
});

// Spinner vs green dot
test("shows spinner when pending", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "create", path: "App.jsx" }, state: "call" }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "create", path: "App.jsx" }, state: "result", result: "ok" }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
