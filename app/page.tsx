"use client";

import { FormEvent, useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Filter = "all" | "pending" | "completed";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");


const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  const savedMode = localStorage.getItem("darkMode");
  setDarkMode(savedMode === "true");
}, []);

function toggleDarkMode() {
  const newMode = !darkMode;
  setDarkMode(newMode);
  localStorage.setItem("darkMode", String(newMode));
}

  async function loadTasks() {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    setTasks(data);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setError("");
    setLoading(true);

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (response.ok) {
      setTitle("");
      setDescription("");
      await loadTasks();
    } else {
      setError("Failed to add task. Please try again.");
    }

    setLoading(false);
  }

  async function toggleTask(task: Task) {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    });

    if (response.ok) {
      await loadTasks();
    } else {
      setError("Failed to update task. Please try again.");
    }
  }

  async function deleteTask(task: Task) {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await loadTasks();
    } else {
      setError("Failed to delete task. Please try again.");
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(task: Task) {
    if (!editTitle.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setError("");

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
    });

    if (response.ok) {
      cancelEditing();
      await loadTasks();
    } else {
      setError("Failed to save changes. Please try again.");
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || "").toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !task.completed) ||
      (filter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <main
  className={`min-h-screen px-4 py-8 transition-colors sm:px-6 lg:px-8 ${
    darkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
  }`}
>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-100">
                  Productivity Dashboard
                </p>

                <h1 className="text-3xl font-bold sm:text-4xl">
                  Task Manager Pro
                </h1>

                <p className="mt-2 max-w-xl text-blue-100">
                  Organize your work, track your progress, and stay productive.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-sm text-blue-100">Total Tasks</p>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </div>
            </div>
          </div>
        </div>
        <button
  onClick={toggleDarkMode}
  className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

        {/* Counters */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">
              {pendingTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Completed</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {completedTasks}
            </p>
          </div>
        </div>

        {/* Add Task */}
        <div
  className={`mb-8 rounded-2xl border p-6 shadow-sm transition-colors sm:p-8 ${
    darkMode
      ? "border-slate-700 bg-slate-900"
      : "border-slate-200 bg-white"
  }`}
>
          <div className="mb-6">
            <h2
  className={`text-2xl font-bold ${
    darkMode ? "text-white" : "text-slate-900"
  }`}
>
              Create a New Task
            </h2>

            <p
  className={`mt-1 text-sm ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`}
>
              Add a task and keep your work organized.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={addTask} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Task Title
              </label>

              <input
                type="text"
                placeholder="e.g. Complete my project"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
  darkMode
    ? "border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
    : "border-slate-300 bg-white text-slate-900"
} focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                placeholder="Add some details about this task..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition ${
  darkMode
    ? "border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
    : "border-slate-300 bg-white text-slate-900"
} focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding Task..." : "+ Add Task"}
            </button>
          </form>
        </div>

        {/* Task Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
             <h2> className={`text-2xl font-bold ${
  darkMode ? "text-white" : "text-slate-900"
}`}
                My Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and track all your tasks.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
  darkMode
    ? "border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
    : "border-slate-300 bg-white text-slate-900"
} focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(["all", "pending", "completed"] as Filter[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  filter === item
                    ? "bg-blue-600 text-white shadow-sm"
                    : darkMode
  ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Tasks */}
          {filteredTasks.length === 0 ? (
            <div className={`mt-8 rounded-2xl border border-dashed px-6 py-12 text-center ${
  darkMode
    ? "border-slate-700 bg-slate-800"
    : "border-slate-300 bg-slate-50"
}`}>
              <div className="text-4xl">📋</div>

              <h3 className={`mt-3 text-lg font-semibold ${
  darkMode ? "text-white" : "text-slate-800"
}`}>
                {search ? "No tasks found" : "No tasks here"}
              </h3>

              <p className={`mt-1 text-sm ${
  darkMode ? "text-slate-400" : "text-slate-500"
}`}>
                {search
                  ? "Try searching with another keyword."
                  : "Create your first task above to get started."}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl border p-5 transition ${
  darkMode
    ? "border-slate-700 bg-slate-800 hover:border-slate-600"
    : "border-slate-200 bg-slate-50 hover:border-slate-300"
}`}
                >
                  {editingId === task.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition ${
  darkMode
    ? "border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
    : "bg-white text-slate-900"
} focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                      />

                      <textarea
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(event.target.value)
                        }
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => saveEdit(task)}
                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Save Changes
                        </button>

                        <button
                          onClick={cancelEditing}
                          className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                              task.completed
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />

                          <div className="min-w-0">
                            <h3
                              className={`break-words text-lg font-bold ${
                                task.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className={`mt-2 break-words text-sm leading-6 ${
  darkMode ? "text-slate-300" : "text-slate-600"
}`}>
                                {task.description}
                              </p>
                            )}

                            <span
                              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                task.completed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {task.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleTask(task)}
                          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                            task.completed
                              ? "bg-amber-500 hover:bg-amber-600"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {task.completed ? "↩ Undo" : "✓ Complete"}
                        </button>

                        <button
                          onClick={() => startEditing(task)}
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          ✎ Edit
                        </button>

                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this task?"
                              )
                            ) {
                              deleteTask(task);
                            }
                          }}
                          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p
  className={`py-8 text-center text-sm ${
    darkMode ? "text-slate-500" : "text-slate-400"
  }`}
>
          Task Manager Pro • Stay organized. Stay productive.
        </p>
      </div>
    </main>
  );
}