"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ItemType = "task" | "hook" | "product" | "script";

type Task = {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  createdAt: string;
};

type Hook = {
  id: string;
  text: string;
  tag: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  link: string;
  status: string;
  createdAt: string;
};

type Script = {
  id: string;
  title: string;
  product: string;
  body: string;
  status: string;
  createdAt: string;
};

type WorkspaceData = {
  tasks: Task[];
  hooks: Hook[];
  products: Product[];
  scripts: Script[];
};

const emptyData: WorkspaceData = {
  tasks: [],
  hooks: [],
  products: [],
  scripts: [],
};

const storageKey = "creator-workspace-data";

const navItems = [
  { label: "Home", view: "home" },
  { label: "Tasks", view: "tasks" },
  { label: "Hook Bank", view: "hooks" },
  { label: "Product Bank", view: "products" },
  { label: "Script Vault", view: "scripts" },
] as const;

const quickAdds: Array<{ label: string; type: ItemType; tone: "rose" | "sage" | "clay" | "sand" }> = [
  { label: "New Task", type: "task", tone: "rose" },
  { label: "New Hook", type: "hook", tone: "sage" },
  { label: "New Product", type: "product", tone: "clay" },
  { label: "New Script", type: "script", tone: "sand" },
];

const formTitles = {
  task: "Add New Task",
  hook: "Save a New Hook",
  product: "Add New Product",
  script: "Create New Script",
};

function makeId() {
  return crypto.randomUUID();
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function IconSlot({ tone = "neutral" }: { tone?: "neutral" | "rose" | "sage" | "clay" | "sand" }) {
  const toneClasses = {
    neutral: "border-[color:var(--line)] bg-white/70",
    rose: "border-[color:var(--rose)] bg-[color:var(--rose)]",
    sage: "border-[color:var(--sage-soft)] bg-[color:var(--sage-soft)]",
    clay: "border-[color:var(--rose-deep)] bg-[color:var(--rose-deep)] text-white",
    sand: "border-[color:var(--sand)] bg-[color:var(--sand)]",
  };

  return (
    <span
      aria-label="Icon placeholder"
      className={`grid size-9 shrink-0 place-items-center rounded-lg border ${toneClasses[tone]}`}
    >
      <span className="size-3 rounded-sm border border-current opacity-70" />
    </span>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {typeof count === "number" ? <span className="text-sm text-[color:var(--sage)]">{count} saved</span> : null}
    </div>
  );
}

function EmptyState({ label, action }: { label: string; action: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--line)] bg-white/50 p-4 text-sm text-[color:var(--muted)]">
      <p>{label}</p>
      <p className="mt-1 text-[color:var(--sage)]">{action}</p>
    </div>
  );
}

export default function Home() {
  const storageReady = useRef(false);
  const [data, setData] = useState<WorkspaceData>(emptyData);
  const [activeView, setActiveView] = useState<(typeof navItems)[number]["view"]>("home");
  const [activeForm, setActiveForm] = useState<ItemType>("task");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [hookText, setHookText] = useState("");
  const [hookTag, setHookTag] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productLink, setProductLink] = useState("");
  const [productStatus, setProductStatus] = useState("Researching");
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptProduct, setScriptProduct] = useState("");
  const [scriptBody, setScriptBody] = useState("");
  const [scriptStatus, setScriptStatus] = useState("Draft");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setData({ ...emptyData, ...JSON.parse(saved) });
        } catch {
          setData(emptyData);
        }
      }
      storageReady.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const metrics = useMemo(
    () => [
      {
        label: "tasks today",
        value: data.tasks.length,
        note: `${data.tasks.filter((task) => task.status === "Done").length} completed`,
        tone: "rose" as const,
      },
      {
        label: "hooks saved",
        value: data.hooks.length,
        note: "total",
        tone: "sage" as const,
      },
      {
        label: "products saved",
        value: data.products.length,
        note: "total",
        tone: "clay" as const,
      },
      {
        label: "scripts saved",
        value: data.scripts.length,
        note: "total",
        tone: "sand" as const,
      },
    ],
    [data],
  );

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () => ({
      tasks: data.tasks.filter((task) => task.title.toLowerCase().includes(query)),
      hooks: data.hooks.filter((hook) => `${hook.text} ${hook.tag}`.toLowerCase().includes(query)),
      products: data.products.filter((product) =>
        `${product.name} ${product.category} ${product.status}`.toLowerCase().includes(query),
      ),
      scripts: data.scripts.filter((script) => `${script.title} ${script.product} ${script.body}`.toLowerCase().includes(query)),
    }),
    [data, query],
  );

  function resetForm() {
    setEditingId(null);
    setTaskTitle("");
    setHookText("");
    setHookTag("");
    setProductName("");
    setProductCategory("");
    setProductLink("");
    setProductStatus("Researching");
    setScriptTitle("");
    setScriptProduct("");
    setScriptBody("");
    setScriptStatus("Draft");
  }

  function startAdd(type: ItemType) {
    resetForm();
    setActiveForm(type);
  }

  function startEdit(type: ItemType, id: string) {
    resetForm();
    setActiveForm(type);
    setEditingId(id);

    if (type === "task") {
      const item = data.tasks.find((task) => task.id === id);
      setTaskTitle(item?.title ?? "");
    }
    if (type === "hook") {
      const item = data.hooks.find((hook) => hook.id === id);
      setHookText(item?.text ?? "");
      setHookTag(item?.tag ?? "");
    }
    if (type === "product") {
      const item = data.products.find((product) => product.id === id);
      setProductName(item?.name ?? "");
      setProductCategory(item?.category ?? "");
      setProductLink(item?.link ?? "");
      setProductStatus(item?.status ?? "Researching");
    }
    if (type === "script") {
      const item = data.scripts.find((script) => script.id === id);
      setScriptTitle(item?.title ?? "");
      setScriptProduct(item?.product ?? "");
      setScriptBody(item?.body ?? "");
      setScriptStatus(item?.status ?? "Draft");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const createdAt = new Date().toISOString();

    if (activeForm === "task" && taskTitle.trim()) {
      setData((current) => ({
        ...current,
        tasks: editingId
          ? current.tasks.map((task) => (task.id === editingId ? { ...task, title: taskTitle.trim() } : task))
          : [{ id: makeId(), title: taskTitle.trim(), status: "To Do", createdAt }, ...current.tasks],
      }));
      resetForm();
    }

    if (activeForm === "hook" && hookText.trim()) {
      setData((current) => ({
        ...current,
        hooks: editingId
          ? current.hooks.map((hook) =>
              hook.id === editingId ? { ...hook, text: hookText.trim(), tag: hookTag.trim() || "Idea" } : hook,
            )
          : [{ id: makeId(), text: hookText.trim(), tag: hookTag.trim() || "Idea", createdAt }, ...current.hooks],
      }));
      resetForm();
    }

    if (activeForm === "product" && productName.trim()) {
      setData((current) => ({
        ...current,
        products: editingId
          ? current.products.map((product) =>
              product.id === editingId
                ? {
                    ...product,
                    name: productName.trim(),
                    category: productCategory.trim() || "General",
                    link: productLink.trim(),
                    status: productStatus,
                  }
                : product,
            )
          : [
              {
                id: makeId(),
                name: productName.trim(),
                category: productCategory.trim() || "General",
                link: productLink.trim(),
                status: productStatus,
                createdAt,
              },
              ...current.products,
            ],
      }));
      resetForm();
    }

    if (activeForm === "script" && scriptTitle.trim()) {
      setData((current) => ({
        ...current,
        scripts: editingId
          ? current.scripts.map((script) =>
              script.id === editingId
                ? {
                    ...script,
                    title: scriptTitle.trim(),
                    product: scriptProduct.trim() || "Unassigned",
                    body: scriptBody.trim(),
                    status: scriptStatus,
                  }
                : script,
            )
          : [
              {
                id: makeId(),
                title: scriptTitle.trim(),
                product: scriptProduct.trim() || "Unassigned",
                body: scriptBody.trim(),
                status: scriptStatus,
                createdAt,
              },
              ...current.scripts,
            ],
      }));
      resetForm();
    }
  }

  function deleteItem(type: ItemType, id: string) {
    setData((current) => ({
      ...current,
      tasks: type === "task" ? current.tasks.filter((task) => task.id !== id) : current.tasks,
      hooks: type === "hook" ? current.hooks.filter((hook) => hook.id !== id) : current.hooks,
      products: type === "product" ? current.products.filter((product) => product.id !== id) : current.products,
      scripts: type === "script" ? current.scripts.filter((script) => script.id !== id) : current.scripts,
    }));
  }

  function cycleTaskStatus(id: string) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== id) return task;
        if (task.status === "To Do") return { ...task, status: "In Progress" };
        if (task.status === "In Progress") return { ...task, status: "Done" };
        return { ...task, status: "To Do" };
      }),
    }));
  }

  function clearAllData() {
    if (window.confirm("Clear all saved workspace data from this browser?")) {
      setData(emptyData);
      resetForm();
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[242px_1fr]">
        <aside className="border-b border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-5 lg:border-b-0 lg:border-r">
          <div className="px-2">
            <p className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-none">creator</p>
            <p className="mt-1 text-2xl text-[color:var(--clay)]">workspace</p>
          </div>

          <nav className="mt-8 flex max-w-full gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                  activeView === item.view
                    ? "bg-[color:var(--rose)] text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--cream)] hover:text-[color:var(--foreground)]"
                }`}
                type="button"
              >
                <IconSlot tone="neutral" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 hidden border-t border-[color:var(--line)] pt-5 lg:block">
            <p className="px-3 text-sm text-[color:var(--muted)]">Quick Add</p>
            <div className="mt-3 space-y-1">
              {quickAdds.map((item) => (
                <button
                  key={item.label}
                  onClick={() => startAdd(item.type)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--muted)] transition hover:bg-[color:var(--cream)]"
                  type="button"
                >
                  <IconSlot tone={item.tone} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 hidden rounded-xl border border-[color:var(--line)] bg-white/70 p-3 lg:flex lg:items-center lg:gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[color:var(--sage)] text-white">K</div>
            <div>
              <p className="text-sm font-semibold">Kourtney</p>
              <p className="text-xs text-[color:var(--muted)]">Creator</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="hidden items-center justify-between gap-3 border-b border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 sm:flex sm:px-8">
            <div className="hidden text-sm text-[color:var(--muted)] sm:block">Saved in this browser</div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex h-10 w-full min-w-0 max-w-xs items-center gap-2 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 text-sm text-[color:var(--muted)] sm:w-80">
                <span className="size-3 rounded-sm border border-current opacity-60" aria-label="Icon placeholder" />
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[color:var(--muted)]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search anything..."
                  type="search"
                  value={search}
                />
              </label>
              <button
                className="rounded-lg border border-[color:var(--line)] bg-white/80 px-3 py-2 text-sm text-[color:var(--muted)]"
                onClick={clearAllData}
                type="button"
              >
                Reset
              </button>
              <div className="grid size-10 place-items-center rounded-full bg-[color:var(--sage)] text-white">K</div>
            </div>
          </header>

          <div className="grid gap-5 px-4 py-5 sm:px-8 2xl:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              <section>
                <h1 className="max-w-4xl break-words font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight sm:text-5xl">
                  welcome back, Kourtney
                </h1>
                <p className="mt-2 text-lg">
                  Let&apos;s <span className="font-semibold text-[color:var(--rose-deep)]">create</span>, plan, and stay consistent.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => (
                    <article key={metric.label} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <IconSlot tone={metric.tone} />
                        <div>
                          <p className="text-sm text-[color:var(--muted)]">{metric.label}</p>
                          <p className="text-3xl font-semibold">{metric.value}</p>
                          <p className="text-sm text-[color:var(--sage)]">{metric.note}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <Panel>
                  <SectionHeader title={editingId ? `Edit ${formTitles[activeForm].replace("Add ", "").replace("Save a ", "")}` : formTitles[activeForm]} />
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    {activeForm === "task" ? (
                      <input
                        className="h-11 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                        onChange={(event) => setTaskTitle(event.target.value)}
                        placeholder="Task title"
                        value={taskTitle}
                      />
                    ) : null}

                    {activeForm === "hook" ? (
                      <>
                        <textarea
                          className="min-h-24 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 py-2 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setHookText(event.target.value)}
                          placeholder="Hook text"
                          value={hookText}
                        />
                        <input
                          className="h-11 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setHookTag(event.target.value)}
                          placeholder="Tag, like Storytime or Problem/Solution"
                          value={hookTag}
                        />
                      </>
                    ) : null}

                    {activeForm === "product" ? (
                      <>
                        <input
                          className="h-11 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setProductName(event.target.value)}
                          placeholder="Product name"
                          value={productName}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                            onChange={(event) => setProductCategory(event.target.value)}
                            placeholder="Category"
                            value={productCategory}
                          />
                          <select
                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                            onChange={(event) => setProductStatus(event.target.value)}
                            value={productStatus}
                          >
                            <option>Researching</option>
                            <option>Requested</option>
                            <option>Received</option>
                            <option>Filmed</option>
                            <option>Posted</option>
                          </select>
                        </div>
                        <input
                          className="h-11 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setProductLink(event.target.value)}
                          placeholder="Product link"
                          value={productLink}
                        />
                      </>
                    ) : null}

                    {activeForm === "script" ? (
                      <>
                        <input
                          className="h-11 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setScriptTitle(event.target.value)}
                          placeholder="Script title"
                          value={scriptTitle}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                            onChange={(event) => setScriptProduct(event.target.value)}
                            placeholder="Related product"
                            value={scriptProduct}
                          />
                          <select
                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                            onChange={(event) => setScriptStatus(event.target.value)}
                            value={scriptStatus}
                          >
                            <option>Draft</option>
                            <option>Ready</option>
                            <option>Filmed</option>
                            <option>Posted</option>
                          </select>
                        </div>
                        <textarea
                          className="min-h-28 w-full rounded-lg border border-[color:var(--line)] bg-white/80 px-3 py-2 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setScriptBody(event.target.value)}
                          placeholder="Script notes, outline, or full script"
                          value={scriptBody}
                        />
                      </>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-[color:var(--sage)] px-4 py-2 text-sm font-semibold text-white" type="submit">
                        {editingId ? "Save Changes" : formTitles[activeForm]}
                      </button>
                      {editingId ? (
                        <button className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm" onClick={resetForm} type="button">
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </form>
                </Panel>

                <section className="min-h-64 rounded-xl border border-[color:var(--line)] bg-[linear-gradient(135deg,#8c8d78,#d8b4a9)] p-7 text-white shadow-sm">
                  <p className="max-w-48 text-3xl leading-snug">small steps create big content.</p>
                  <div className="mt-8 h-24 rounded-lg border border-white/35 bg-white/15" aria-label="Image placeholder" />
                </section>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <Panel>
                  <SectionHeader title="Today's Tasks" count={filtered.tasks.length} />
                  <div className="space-y-2">
                    {filtered.tasks.length ? (
                      filtered.tasks.slice(0, activeView === "tasks" ? undefined : 5).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 px-3 py-2">
                          <button
                            className={`size-4 rounded border ${task.status === "Done" ? "border-[color:var(--sage)] bg-[color:var(--sage)]" : "border-[color:var(--muted)]"}`}
                            onClick={() => cycleTaskStatus(task.id)}
                            type="button"
                            aria-label="Change task status"
                          />
                          <span className={`min-w-0 flex-1 text-sm ${task.status === "Done" ? "text-[color:var(--muted)] line-through" : ""}`}>
                            {task.title}
                          </span>
                          <span className="rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs text-[color:var(--rose-deep)]">{task.status}</span>
                          <button className="text-xs text-[color:var(--sage)]" onClick={() => startEdit("task", task.id)} type="button">
                            Edit
                          </button>
                          <button className="text-xs text-[color:var(--rose-deep)]" onClick={() => deleteItem("task", task.id)} type="button">
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState label="No tasks saved yet." action="Add a task to start planning today." />
                    )}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeader title="Recent Scripts" count={filtered.scripts.length} />
                  <div className="space-y-3">
                    {filtered.scripts.length ? (
                      filtered.scripts.slice(0, activeView === "scripts" ? undefined : 4).map((script) => (
                        <article key={script.id} className="flex gap-3 rounded-lg border border-[color:var(--line)] bg-[color:var(--cream)]/60 p-3">
                          <IconSlot tone="neutral" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{script.title}</p>
                            <p className="text-xs text-[color:var(--muted)]">{script.product} · {script.status}</p>
                          </div>
                          <div className="flex shrink-0 gap-2 text-xs">
                            <button className="text-[color:var(--sage)]" onClick={() => startEdit("script", script.id)} type="button">
                              Edit
                            </button>
                            <button className="text-[color:var(--rose-deep)]" onClick={() => deleteItem("script", script.id)} type="button">
                              Delete
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState label="No scripts saved yet." action="Create a script draft when you have a video idea." />
                    )}
                  </div>
                </Panel>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <Panel>
                  <SectionHeader title="Recent Hooks" count={filtered.hooks.length} />
                  <div className="space-y-3">
                    {filtered.hooks.length ? (
                      filtered.hooks.slice(0, activeView === "hooks" ? undefined : 4).map((hook) => (
                        <div key={hook.id} className="flex items-center gap-3 rounded-lg bg-[color:var(--sage-soft)] px-3 py-2">
                          <IconSlot tone="sage" />
                          <p className="min-w-0 flex-1 truncate text-sm">{hook.text}</p>
                          <span className="rounded-full bg-white/50 px-3 py-1 text-xs">{hook.tag}</span>
                          <button className="text-xs text-[color:var(--sage)]" onClick={() => startEdit("hook", hook.id)} type="button">
                            Edit
                          </button>
                          <button className="text-xs text-[color:var(--rose-deep)]" onClick={() => deleteItem("hook", hook.id)} type="button">
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState label="No hooks saved yet." action="Save hook ideas as they come to you." />
                    )}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeader title="Recent Products" count={filtered.products.length} />
                  <div className="space-y-2">
                    {filtered.products.length ? (
                      filtered.products.slice(0, activeView === "products" ? undefined : 4).map((product) => (
                        <article key={product.id} className="flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 p-2">
                          <IconSlot tone="clay" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
                            <p className="text-xs text-[color:var(--muted)]">{product.category} · {product.status}</p>
                          </div>
                          <div className="flex shrink-0 gap-2 text-xs">
                            {product.link ? (
                              <a className="text-[color:var(--sage)]" href={product.link} rel="noreferrer" target="_blank">
                                Open
                              </a>
                            ) : null}
                            <button className="text-[color:var(--sage)]" onClick={() => startEdit("product", product.id)} type="button">
                              Edit
                            </button>
                            <button className="text-[color:var(--rose-deep)]" onClick={() => deleteItem("product", product.id)} type="button">
                              Delete
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState label="No products saved yet." action="Add products you want to research or film." />
                    )}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="space-y-5">
              <Panel>
                <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                <div className="space-y-3">
                  {quickAdds.map((action) => (
                    <button
                      key={action.label}
                      className={`flex h-14 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-semibold ${
                        action.tone === "clay"
                          ? "bg-[color:var(--rose-deep)] text-white"
                          : action.tone === "sage"
                            ? "bg-[color:var(--sage-soft)]"
                            : action.tone === "sand"
                              ? "bg-[color:var(--sand)]"
                              : "bg-[color:var(--rose)]"
                      }`}
                      onClick={() => startAdd(action.type)}
                      type="button"
                    >
                      <IconSlot tone={action.tone} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel>
                <h2 className="mb-3 text-lg font-semibold">Storage</h2>
                <p className="text-sm leading-6 text-[color:var(--muted)]">
                  Your workspace saves in this browser with local storage. No login, database, AI, Notion, commissions, or analytics.
                </p>
                <p className="mt-3 text-xs text-[color:var(--sage)]">Last opened: {todayLabel()}</p>
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
