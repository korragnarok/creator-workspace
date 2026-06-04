const navItems = ["Home", "Tasks", "Hook Bank", "Product Bank", "Script Vault"];

const quickAdds = ["New Task", "New Hook", "New Product", "New Script"];

const metrics = [
  { label: "tasks today", value: "6", note: "2 completed", tone: "rose" },
  { label: "hooks saved", value: "42", note: "this week", tone: "sage" },
  { label: "products saved", value: "18", note: "total", tone: "clay" },
  { label: "scripts saved", value: "27", note: "total", tone: "sand" },
];

const tasks = [
  { title: "Film TikTok video", status: "Done", complete: true },
  { title: "Edit product review", status: "In Progress" },
  { title: "Post new video", status: "To Do" },
  { title: "Go live at 6pm", status: "To Do" },
  { title: "Follow up with brand", status: "To Do" },
];

const scripts = [
  { title: "Morning skincare routine", category: "Skincare Product", date: "May 12" },
  { title: "3 reasons this blender is a must", category: "Kitchen Finds", date: "May 11" },
  { title: "What I wish I knew sooner", category: "Personal Story", date: "May 10" },
];

const hooks = [
  { text: "You won't believe what happened when...", tag: "Storytime" },
  { text: "This changed the way I...", tag: "Problem/Solution" },
  { text: "I was today years old when I found out...", tag: "Curiosity" },
];

const products = [
  { name: "Pink Heatless Curl Set", category: "Beauty", score: "15%" },
  { name: "Stanley Quencher 40oz", category: "Drinkware", score: "10%" },
  { name: "Cloud Slides", category: "Fashion", score: "12%" },
];

const actions = [
  { label: "Add New Task", tone: "rose" },
  { label: "Save a New Hook", tone: "sage" },
  { label: "Add New Product", tone: "clay" },
  { label: "Create New Script", tone: "sand" },
];

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

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button className="text-sm text-[color:var(--sage)]" type="button">
        View all
      </button>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[242px_1fr]">
        <aside className="border-b border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-5 lg:border-b-0 lg:border-r">
          <div className="px-2">
            <p className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-none">creator</p>
            <p className="mt-1 text-2xl text-[color:var(--clay)]">workspace</p>
          </div>

          <nav className="mt-8 flex max-w-full gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item, index) => (
              <a
                key={item}
                href="#"
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  index === 0
                    ? "bg-[color:var(--rose)] text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--cream)] hover:text-[color:var(--foreground)]"
                }`}
              >
                <IconSlot tone="neutral" />
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-8 hidden border-t border-[color:var(--line)] pt-5 lg:block">
            <p className="px-3 text-sm text-[color:var(--muted)]">Quick Add</p>
            <div className="mt-3 space-y-1">
              {quickAdds.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--muted)] transition hover:bg-[color:var(--cream)]"
                  type="button"
                >
                  <IconSlot tone="neutral" />
                  {item}
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
            <div className="hidden text-sm text-[color:var(--muted)] sm:block">Daily creator desk</div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex h-10 w-full min-w-0 max-w-xs items-center gap-2 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 text-sm text-[color:var(--muted)] sm:w-80">
                <span className="size-3 rounded-sm border border-current opacity-60" aria-label="Icon placeholder" />
                <span>Search anything...</span>
              </label>
              <button className="grid size-10 place-items-center rounded-lg border border-[color:var(--line)] bg-white/80" type="button">
                <IconSlot tone="neutral" />
              </button>
              <div className="grid size-10 place-items-center rounded-full bg-[color:var(--sage)] text-white">K</div>
            </div>
          </header>

          <div className="grid gap-5 px-4 py-5 sm:px-8 2xl:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              <section className="grid gap-5 2xl:grid-cols-[1fr_350px]">
                <div>
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
                          <IconSlot tone={metric.tone as "rose" | "sage" | "clay" | "sand"} />
                          <div>
                            <p className="text-sm text-[color:var(--muted)]">{metric.label}</p>
                            <p className="text-3xl font-semibold">{metric.value}</p>
                            <p className="text-sm text-[color:var(--sage)]">{metric.note}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="min-h-52 rounded-xl border border-[color:var(--line)] bg-[linear-gradient(135deg,#8c8d78,#d8b4a9)] p-7 text-white shadow-sm">
                  <p className="max-w-40 text-3xl leading-snug">small steps create big content.</p>
                  <div className="mt-8 h-20 rounded-lg border border-white/35 bg-white/15" aria-label="Image placeholder" />
                </div>
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                <Panel>
                  <SectionHeader title="Today's Tasks" />
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.title} className="flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 px-3 py-2">
                        <span className={`size-4 rounded border ${task.complete ? "border-[color:var(--sage)] bg-[color:var(--sage)]" : "border-[color:var(--muted)]"}`} />
                        <span className={`flex-1 text-sm ${task.complete ? "text-[color:var(--muted)] line-through" : ""}`}>{task.title}</span>
                        <span className="rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs text-[color:var(--rose-deep)]">{task.status}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-[color:var(--sage)] text-sm font-semibold text-white" type="button">
                    + New Task
                  </button>
                </Panel>

                <Panel>
                  <SectionHeader title="Recent Scripts" />
                  <div className="space-y-3">
                    {scripts.map((script) => (
                      <article key={script.title} className="flex gap-3 rounded-lg border border-[color:var(--line)] bg-[color:var(--cream)]/60 p-3">
                        <IconSlot tone="neutral" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{script.title}</p>
                          <p className="text-xs text-[color:var(--muted)]">{script.category}</p>
                        </div>
                        <p className="text-xs text-[color:var(--muted)]">{script.date}</p>
                      </article>
                    ))}
                  </div>
                  <button className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-[color:var(--rose)] text-sm font-semibold" type="button">
                    + New Script
                  </button>
                </Panel>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <Panel>
                  <SectionHeader title="Recent Hooks" />
                  <div className="space-y-3">
                    {hooks.map((hook) => (
                      <div key={hook.text} className="flex items-center gap-3 rounded-lg bg-[color:var(--sage-soft)] px-3 py-2">
                        <IconSlot tone="sage" />
                        <p className="min-w-0 flex-1 truncate text-sm">{hook.text}</p>
                        <span className="rounded-full bg-white/50 px-3 py-1 text-xs">{hook.tag}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeader title="Recent Products" />
                  <div className="space-y-2">
                    {products.map((product) => (
                      <article key={product.name} className="flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 p-2">
                        <IconSlot tone="clay" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{product.name}</p>
                          <p className="text-xs text-[color:var(--muted)]">{product.category}</p>
                        </div>
                        <span className="rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs">{product.score}</span>
                      </article>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="space-y-5">
              <Panel>
                <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                <div className="space-y-3">
                  {actions.map((action) => (
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
                      type="button"
                    >
                      <IconSlot tone={action.tone as "rose" | "sage" | "clay" | "sand"} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </Panel>

              <section className="min-h-64 rounded-xl border border-[color:var(--line)] bg-[linear-gradient(135deg,#bd8377,#e3c9b1)] p-8 text-white shadow-sm">
                <p className="max-w-52 text-4xl italic leading-tight">consistency is your superpower.</p>
                <div className="mt-8 h-24 rounded-lg border border-white/35 bg-white/15" aria-label="Image placeholder" />
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
