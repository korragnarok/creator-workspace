import {
  Archive,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Sparkles,
  Video,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Daily Todo", icon: CalendarCheck },
  { label: "Hook Bank", icon: Sparkles },
  { label: "Product Bank", icon: Package },
  { label: "Script Vault", icon: FileText },
];

const tasks = [
  {
    title: "Film intro options for serum bundle",
    tag: "Video",
    status: "Doing",
    time: "Today",
  },
  {
    title: "Shortlist five hooks for kitchen gadget",
    tag: "Hooks",
    status: "Next",
    time: "Today",
  },
  {
    title: "Update product notes after brand call",
    tag: "Products",
    status: "Later",
    time: "Tomorrow",
  },
];

const videos = [
  { title: "3 reasons this desk lamp is everywhere", views: "128K", saves: "4.8K" },
  { title: "GRWM with the travel steamer", views: "94K", saves: "2.1K" },
  { title: "Tiny kitchen upgrade under $20", views: "61K", saves: "1.7K" },
];

const products = [
  { name: "Foldable travel steamer", status: "Filmed", angle: "Pack with me" },
  { name: "Glass skin serum set", status: "Script ready", angle: "Before makeup" },
  { name: "Cordless desk lamp", status: "Researching", angle: "Apartment upgrade" },
];

const hooks = [
  "I did not expect this to solve my tiny apartment problem.",
  "This looks boring until you see what it does in ten seconds.",
  "Creators are missing this one detail before filming product videos.",
];

const scripts = [
  { title: "Soft sell skincare demo", status: "Ready", product: "Glass skin serum set" },
  { title: "Problem-solution desk setup", status: "Draft", product: "Cordless desk lamp" },
  { title: "Travel bag packing sequence", status: "Filmed", product: "Foldable travel steamer" },
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-slate-200 bg-white px-4 py-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Archive size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Creator Desk</p>
              <p className="text-xs text-slate-500">TikTok Shop workspace</p>
            </div>
          </div>

          <nav className="mt-7 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    item.active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Wednesday workspace</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Organize today&apos;s creator work.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Search workspace"
                type="button"
              >
                <Search size={18} aria-hidden="true" />
              </button>
              <button
                className="flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                type="button"
              >
                <Plus size={18} aria-hidden="true" />
                Add item
              </button>
            </div>
          </header>

          <div className="grid gap-4 py-5 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Open tasks</p>
              <p className="mt-2 text-3xl font-semibold">8</p>
              <p className="mt-2 text-sm text-slate-500">3 planned for today</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Hooks saved</p>
              <p className="mt-2 text-3xl font-semibold">42</p>
              <p className="mt-2 text-sm text-slate-500">6 marked as favorites</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Products active</p>
              <p className="mt-2 text-3xl font-semibold">14</p>
              <p className="mt-2 text-sm text-slate-500">5 ready for content</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-rose-600" aria-hidden="true" />
                    <h2 className="text-base font-semibold">Daily Todo</h2>
                  </div>
                  <StatusPill>Today</StatusPill>
                </div>
                <div className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <div key={task.title} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{task.tag} · {task.time}</p>
                      </div>
                      <StatusPill>{task.status}</StatusPill>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Video size={18} className="text-rose-600" aria-hidden="true" />
                    <h2 className="text-base font-semibold">Top Performing Videos</h2>
                  </div>
                  <StatusPill>Manual</StatusPill>
                </div>
                <div className="grid gap-3 p-4 md:grid-cols-3">
                  {videos.map((video) => (
                    <article key={video.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="min-h-12 text-sm font-medium leading-6">{video.title}</p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-950">{video.views}</span>
                        <span className="text-slate-500">{video.saves} saves</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <Sparkles size={18} className="text-rose-600" aria-hidden="true" />
                  <h2 className="text-base font-semibold">Hook Bank</h2>
                </div>
                <div className="space-y-2 p-4">
                  {hooks.map((hook) => (
                    <p key={hook} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-6">
                      {hook}
                    </p>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-rose-600" aria-hidden="true" />
                    <h2 className="text-base font-semibold">Recent Products</h2>
                  </div>
                  <StatusPill>3 new</StatusPill>
                </div>
                <div className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <article key={product.name} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{product.angle}</p>
                        </div>
                        <StatusPill>{product.status}</StatusPill>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <FileText size={18} className="text-rose-600" aria-hidden="true" />
                  <h2 className="text-base font-semibold">Script Vault</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {scripts.map((script) => (
                    <article key={script.title} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{script.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{script.product}</p>
                        </div>
                        <StatusPill>{script.status}</StatusPill>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={18} className="text-rose-300" aria-hidden="true" />
                  <h2 className="text-base font-semibold">MVP scope</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Local storage first, no AI, no Notion, no commission tracking, no sales analytics.
                </p>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
