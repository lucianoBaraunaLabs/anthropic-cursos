import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFilename(args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args: Record<string, unknown>, isDone: boolean): string {
  const filename = getFilename(args);
  const command = args.command as string | undefined;

  if (toolName === "str_replace_editor") {
    if (command === "create") return isDone ? `Created ${filename}` : `Creating ${filename}`;
    if (command === "view") return isDone ? `Read ${filename}` : `Reading ${filename}`;
    if (command === "str_replace" || command === "insert" || command === "undo_edit") {
      return isDone ? `Edited ${filename}` : `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    if (command === "rename") return isDone ? `Renamed ${filename}` : `Renaming ${filename}`;
    if (command === "delete") return isDone ? `Deleted ${filename}` : `Deleting ${filename}`;
  }

  return isDone ? `Ran ${toolName}` : `Running ${toolName}`;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const label = getLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
