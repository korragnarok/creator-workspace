"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ItemType = "task" | "hook" | "product" | "script" | "content";
type ViewType = "home" | "tasks" | "tracker" | "hooks" | "products" | "scripts";

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
  brand: string;
  category: string;
  link: string;
  status: string;
  unitsSold: number;
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

type DailyProduct = {
  id: string;
  productName: string;
  brand: string;
  link: string;
  script: string;
  done: boolean;
  createdAt: string;
};

type ContentItem = {
  id: string;
  productName: string;
  brand: string;
  script: string;
  type: string;
  views48: string;
  gotSales: "Unknown" | "Yes" | "No";
  datePosted: string;
  sourceDailyProductId?: string;
  createdAt: string;
};

type WorkspaceData = {
  tasks: Task[];
  hooks: Hook[];
  products: Product[];
  scripts: Script[];
  content: ContentItem[];
  coreBrands: string[];
  dailyProducts: Record<string, DailyProduct[]>;
};

const emptyData: WorkspaceData = {
  tasks: [],
  hooks: [],
  products: [],
  scripts: [],
  content: [],
  coreBrands: ["", "", "", "", ""],
  dailyProducts: {},
};

const storageKey = "creator-workspace-data";

const contentTypes = [
  "Talking-Head Review",
  "Aesthetic B-Roll",
  "Voiceover Demo",
  "Problem/Solution",
  "Storytime",
  "Things I Wish I Bought Sooner",
  "Comparison",
  "Unboxing",
  "First Impression",
  "Before & After",
  "Relatable Mom/Lifestyle Skit",
  "Tutorial/How-To-Use",
  "POV Style",
  "ASMR",
];

const productCategories = ["Lifestyle", "Beauty", "Tech", "Outdoor", "Health", "Fashion"];

const navItems = [
  { label: "Home", view: "home" },
  { label: "Content", view: "tasks" },
  { label: "Tracker", view: "tracker" },
  { label: "Hook Bank", view: "hooks" },
  { label: "Product Bank", view: "products" },
  { label: "Script Vault", view: "scripts" },
] as const;

const viewToForm: Record<Exclude<ViewType, "home">, ItemType> = {
  tasks: "product",
  tracker: "content",
  hooks: "hook",
  products: "product",
  scripts: "script",
};

const typeToView: Record<ItemType, Exclude<ViewType, "home">> = {
  task: "tasks",
  hook: "hooks",
  product: "products",
  script: "scripts",
  content: "tracker",
};

const viewDetails: Record<ViewType, { title: string; subtitle: string }> = {
  home: {
    title: "welcome back, Kourtney",
    subtitle: "Let's create, plan, and stay consistent.",
  },
  tasks: {
    title: "Daily To Do",
    subtitle: "Build a product queue, sort by brand, and save scripts for the day.",
  },
  tracker: {
    title: "Content Tracker",
    subtitle: "Review posted content, 48-hour views, sales signal, post date, and content type.",
  },
  hooks: {
    title: "Hook Bank",
    subtitle: "Save scroll-stopping openings for future videos.",
  },
  products: {
    title: "Product Bank",
    subtitle: "Track products, links, categories, and content status.",
  },
  scripts: {
    title: "Script Vault",
    subtitle: "Draft, organize, and revisit your content scripts.",
  },
};

const quickAdds: Array<{ label: string; type: ItemType; tone: "rose" | "sage" | "clay" | "sand" }> = [
  { label: "New Hook", type: "hook", tone: "sage" },
  { label: "New Product", type: "product", tone: "clay" },
  { label: "New Script", type: "script", tone: "sand" },
];

const formTitles = {
  task: "Add New Task",
  hook: "Save a New Hook",
  product: "Add New Product",
  script: "Create New Script",
  content: "Add Content",
};

function makeId() {
  return crypto.randomUUID();
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function readableDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function parseCount(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeProductCategory(category?: string) {
  const match = productCategories.find((item) => item.toLowerCase() === category?.toLowerCase());
  return match ?? "Lifestyle";
}

function normalizeCoreBrands(coreBrands?: string[]) {
  return Array.from({ length: 5 }, (_, index) => coreBrands?.[index] ?? "");
}

function normalizeWorkspaceData(saved: Partial<WorkspaceData>): WorkspaceData {
  const normalized = {
    ...emptyData,
    ...saved,
    content: saved.content ?? [],
    coreBrands: normalizeCoreBrands(saved.coreBrands),
    dailyProducts: saved.dailyProducts ?? {},
    products: (saved.products ?? []).map((product) => ({
      ...product,
      brand: product.brand ?? "",
      category: normalizeProductCategory(product.category),
      unitsSold: product.unitsSold ?? 0,
    })),
  };

  const today = getDateKey(new Date());
  const yesterday = getDateKey(addDays(new Date(), -1));
  const yesterdayProducts = normalized.dailyProducts[yesterday] ?? [];
  const todayProducts = normalized.dailyProducts[today] ?? [];
  const todayKeys = new Set(todayProducts.map((product) => `${product.productName}|${product.brand}`.toLowerCase()));
  const carryOver = yesterdayProducts
    .filter((product) => !product.done)
    .filter((product) => !todayKeys.has(`${product.productName}|${product.brand}`.toLowerCase()))
    .map((product) => ({
      ...product,
      id: makeId(),
      done: false,
      createdAt: new Date().toISOString(),
    }));

  if (carryOver.length) {
    normalized.dailyProducts = {
      ...normalized.dailyProducts,
      [today]: [...todayProducts, ...carryOver],
    };
  }

  return normalized;
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
	      <img alt="" className="size-5 object-contain" src={`/icons/${tone}-icon-placeholder.png`} />
	    </span>
	  );
	}

function CategoryIcon({ category }: { category: string }) {
  const normalizedCategory = normalizeProductCategory(category);
  const categoryIndex = productCategories.indexOf(normalizedCategory);
  const tones = ["bg-[color:var(--sage-soft)]", "bg-[color:var(--rose)]", "bg-[color:var(--cream)]", "bg-[color:var(--sand)]", "bg-white/70", "bg-[color:var(--sage-soft)]"];

	  return (
	    <span
	      aria-label={`${normalizedCategory} icon placeholder`}
	      className={`grid size-11 shrink-0 place-items-center rounded-xl border border-[color:var(--line)] ${tones[categoryIndex]}`}
	    >
	      <img
	        alt=""
	        className="size-6 object-contain"
	        src={`/icons/${normalizedCategory.toLowerCase()}-category-icon.png`}
	      />
	    </span>
	  );
	}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  count,
  actionLabel,
  onAction,
}: {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {typeof count === "number" ? <span className="text-sm text-[color:var(--sage)]">{count} saved</span> : null}
        {actionLabel && onAction ? (
          <button className="rounded-lg bg-[color:var(--sage)] px-3 py-1.5 text-sm font-semibold text-white" onClick={onAction} type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
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
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<WorkspaceData>(emptyData);
  const [activeView, setActiveView] = useState<ViewType>("home");
  const [activeForm, setActiveForm] = useState<ItemType>("task");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
  const [dailyBrandFilter, setDailyBrandFilter] = useState("All");
  const [dailySort, setDailySort] = useState<"original" | "brand" | "done" | "remaining">("original");

  const [taskTitle, setTaskTitle] = useState("");
  const [hookText, setHookText] = useState("");
  const [hookTag, setHookTag] = useState("");
  const [productName, setProductName] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("Lifestyle");
  const [productLink, setProductLink] = useState("");
  const [productStatus, setProductStatus] = useState("Researching");
  const [productUnitsSold, setProductUnitsSold] = useState("0");
  const [dailyProductName, setDailyProductName] = useState("");
  const [dailyProductBrand, setDailyProductBrand] = useState("");
  const [dailyProductLink, setDailyProductLink] = useState("");
  const [dailyProductScript, setDailyProductScript] = useState("");
  const [dailySaveProduct, setDailySaveProduct] = useState(true);
  const [dailySaveScript, setDailySaveScript] = useState(false);
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptProduct, setScriptProduct] = useState("");
  const [scriptBody, setScriptBody] = useState("");
  const [scriptStatus, setScriptStatus] = useState("Draft");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setData(normalizeWorkspaceData(JSON.parse(saved)));
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

	  const todaysProducts = useMemo(() => data.dailyProducts[selectedDate] ?? [], [data.dailyProducts, selectedDate]);
	  const completedToday = todaysProducts.filter((product) => product.done).length;
	  const totalUnitsSold = useMemo(() => data.products.reduce((total, product) => total + product.unitsSold, 0), [data.products]);

	  const metrics = useMemo(
	    () => [
	      {
	        label: "total products",
	        value: data.products.length,
	        note: "in product bank",
	        tone: "rose" as const,
	      },
	      {
	        label: "total videos",
	        value: data.content.length,
	        note: "tracked",
	        tone: "sage" as const,
	      },
	      {
	        label: "units sold",
	        value: totalUnitsSold,
	        note: "total",
	        tone: "clay" as const,
	      },
	      {
	        label: "to do",
	        value: todaysProducts.length,
	        note: `${completedToday} done today`,
	        tone: "sand" as const,
	      },
	    ],
	    [completedToday, data.content.length, data.products.length, todaysProducts.length, totalUnitsSold],
	  );

  const query = search.trim().toLowerCase();
  const dailyBrands = useMemo(
    () => ["All", ...Array.from(new Set(todaysProducts.map((product) => product.brand).filter(Boolean))).sort()],
    [todaysProducts],
  );
  const visibleDailyProducts = useMemo(() => {
    const filteredByBrand =
      dailyBrandFilter === "All" ? todaysProducts : todaysProducts.filter((product) => product.brand === dailyBrandFilter);
    const filteredBySearch = filteredByBrand.filter((product) =>
      `${product.productName} ${product.brand} ${product.script}`.toLowerCase().includes(query),
    );

    return [...filteredBySearch].sort((a, b) => {
      if (dailySort === "brand") return a.brand.localeCompare(b.brand) || a.productName.localeCompare(b.productName);
      if (dailySort === "done") return Number(b.done) - Number(a.done) || a.productName.localeCompare(b.productName);
      if (dailySort === "remaining") return Number(a.done) - Number(b.done) || a.productName.localeCompare(b.productName);
      return 0;
    });
  }, [dailyBrandFilter, dailySort, query, todaysProducts]);

  const filtered = useMemo(
    () => ({
      tasks: data.tasks.filter((task) => task.title.toLowerCase().includes(query)),
      hooks: data.hooks.filter((hook) => `${hook.text} ${hook.tag}`.toLowerCase().includes(query)),
      products: data.products.filter((product) =>
        `${product.name} ${product.brand} ${product.category} ${product.status}`.toLowerCase().includes(query),
      ),
      scripts: data.scripts.filter((script) => `${script.title} ${script.product} ${script.body}`.toLowerCase().includes(query)),
    }),
    [data, query],
  );
  const topProducts = useMemo(
    () => [...data.products].filter((product) => product.unitsSold > 0).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 4),
    [data.products],
  );
  const topProductMaxUnits = topProducts[0]?.unitsSold ?? 0;

  function resetForm() {
    setEditingId(null);
    setTaskTitle("");
    setHookText("");
    setHookTag("");
    setProductName("");
    setProductBrand("");
    setProductCategory("Lifestyle");
    setProductLink("");
    setProductStatus("Researching");
    setProductUnitsSold("0");
    setDailyProductName("");
    setDailyProductBrand("");
    setDailyProductLink("");
    setDailyProductScript("");
    setDailySaveProduct(true);
    setDailySaveScript(false);
    setScriptTitle("");
    setScriptProduct("");
    setScriptBody("");
    setScriptStatus("Draft");
  }

  function handleViewChange(view: ViewType) {
    setActiveView(view);
    if (view !== "home") {
      setActiveForm(viewToForm[view]);
      resetForm();
    }
  }

  function startAdd(type: ItemType) {
    resetForm();
    setActiveForm(type);
    setActiveView(typeToView[type]);
    window.setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function startEdit(type: ItemType, id: string) {
    resetForm();
    setActiveForm(type);
    setActiveView(typeToView[type]);
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
      setProductBrand(item?.brand ?? "");
      setProductCategory(normalizeProductCategory(item?.category));
      setProductLink(item?.link ?? "");
      setProductStatus(item?.status ?? "Researching");
      setProductUnitsSold(String(item?.unitsSold ?? 0));
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
                    brand: productBrand.trim(),
	                    category: normalizeProductCategory(productCategory),
                    link: productLink.trim(),
                    status: productStatus,
                    unitsSold: parseCount(productUnitsSold),
                  }
                : product,
            )
          : [
              {
                id: makeId(),
                name: productName.trim(),
                brand: productBrand.trim(),
	                category: normalizeProductCategory(productCategory),
                link: productLink.trim(),
                status: productStatus,
                unitsSold: parseCount(productUnitsSold),
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

  function addDailyProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dailyProductName.trim()) return;

    const createdAt = new Date().toISOString();
    const dailyItem: DailyProduct = {
      id: makeId(),
      productName: dailyProductName.trim(),
      brand: dailyProductBrand.trim(),
      link: dailyProductLink.trim(),
      script: dailyProductScript.trim(),
      done: false,
      createdAt,
    };

    setData((current) => {
      const nextProducts =
        dailySaveProduct && dailyProductName.trim()
          ? [
              {
                id: makeId(),
                name: dailyProductName.trim(),
                brand: dailyProductBrand.trim(),
	                category: "Lifestyle",
                link: dailyProductLink.trim(),
                status: "Planned",
                unitsSold: 0,
                createdAt,
              },
              ...current.products,
            ]
          : current.products;

      const nextScripts =
        dailySaveScript && dailyProductScript.trim()
          ? [
              {
                id: makeId(),
                title: `${dailyProductName.trim()} script`,
                product: dailyProductName.trim(),
                body: dailyProductScript.trim(),
                status: "Saved",
                createdAt,
              },
              ...current.scripts,
            ]
          : current.scripts;

      return {
        ...current,
        products: nextProducts,
        scripts: nextScripts,
        dailyProducts: {
          ...current.dailyProducts,
          [selectedDate]: [dailyItem, ...(current.dailyProducts[selectedDate] ?? [])],
        },
      };
    });

    setDailyProductName("");
    setDailyProductBrand("");
    setDailyProductLink("");
    setDailyProductScript("");
    setDailySaveProduct(true);
    setDailySaveScript(false);
  }

	  function updateDailyProduct(id: string, changes: Partial<DailyProduct>) {
	    setData((current) => {
	      const currentDailyProducts = current.dailyProducts[selectedDate] ?? [];
	      const targetProduct = currentDailyProducts.find((product) => product.id === id);
	      const nextDailyProducts = currentDailyProducts.map((product) => (product.id === id ? { ...product, ...changes } : product));
	      const shouldCreateContent = changes.done && targetProduct && !current.content.some((item) => item.sourceDailyProductId === id);
	      const nextContent =
	        shouldCreateContent && targetProduct
	          ? [
	              {
	                id: makeId(),
	                productName: targetProduct.productName,
	                brand: targetProduct.brand,
	                script: targetProduct.script,
	                type: "",
	                views48: "",
	                gotSales: "Unknown" as const,
	                datePosted: getDateKey(new Date()),
	                sourceDailyProductId: id,
	                createdAt: new Date().toISOString(),
	              },
	              ...current.content,
	            ]
	          : current.content;

	      return {
	        ...current,
	        content: nextContent,
	        dailyProducts: {
	          ...current.dailyProducts,
	          [selectedDate]: nextDailyProducts,
        },
      };
    });
  }

	  function updateContentItem(id: string, changes: Partial<ContentItem>) {
	    setData((current) => ({
	      ...current,
	      content: current.content.map((item) => (item.id === id ? { ...item, ...changes } : item)),
	    }));
	  }

	  function updateCoreBrand(index: number, value: string) {
	    setData((current) => {
	      const nextCoreBrands = normalizeCoreBrands(current.coreBrands);
	      nextCoreBrands[index] = value;
	      return {
	        ...current,
	        coreBrands: nextCoreBrands,
	      };
	    });
	  }

	  function removeDailyProduct(id: string) {
    setData((current) => ({
      ...current,
      dailyProducts: {
        ...current.dailyProducts,
        [selectedDate]: (current.dailyProducts[selectedDate] ?? []).filter((product) => product.id !== id),
      },
    }));
  }

  function restartSelectedDay() {
    if (window.confirm("Clear this day's product queue?")) {
      setData((current) => ({
        ...current,
        dailyProducts: {
          ...current.dailyProducts,
          [selectedDate]: [],
        },
      }));
    }
  }

  function saveDailyScriptToVault(product: DailyProduct) {
    if (!product.script.trim()) return;
    const createdAt = new Date().toISOString();
    setData((current) => ({
      ...current,
      scripts: [
        {
          id: makeId(),
          title: `${product.productName} script`,
          product: product.productName,
          body: product.script.trim(),
          status: "Saved",
          createdAt,
        },
        ...current.scripts,
      ],
    }));
  }

	  function deleteItem(type: ItemType, id: string) {
	    setData((current) => ({
	      ...current,
	      tasks: type === "task" ? current.tasks.filter((task) => task.id !== id) : current.tasks,
	      hooks: type === "hook" ? current.hooks.filter((hook) => hook.id !== id) : current.hooks,
	      products: type === "product" ? current.products.filter((product) => product.id !== id) : current.products,
	      scripts: type === "script" ? current.scripts.filter((script) => script.id !== id) : current.scripts,
	      content: type === "content" ? current.content.filter((item) => item.id !== id) : current.content,
	    }));
	  }

  function clearAllData() {
    if (window.confirm("Clear all saved workspace data from this browser?")) {
      setData(emptyData);
      resetForm();
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--background)] pb-24 text-[color:var(--foreground)] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[242px_1fr]">
        <aside className="bg-[color:var(--paper)] px-6 py-7 lg:border-r lg:border-[color:var(--line)] lg:px-4 lg:py-5">
          <div className="flex items-start justify-between gap-4 px-0 lg:block lg:px-2">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-none">creator</p>
              <p className="mt-1 text-2xl text-[color:var(--clay)]">workspace</p>
            </div>
            <button
              className="grid size-11 place-items-center rounded-full border border-[color:var(--line)] bg-white/70 lg:hidden"
              type="button"
              aria-label="Notifications"
	            >
	              <img alt="" className="size-5 object-contain" src="/icons/notification-icon.png" />
	            </button>
          </div>

          <nav className="mt-8 hidden max-w-full gap-2 overflow-x-auto pb-1 lg:flex lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleViewChange(item.view)}
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
	            <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-[color:var(--sage)] text-white">
	              <img alt="" className="size-full object-cover" src="/icons/profile-avatar-placeholder.png" />
	            </div>
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
	                <img alt="" className="size-4 object-contain" src="/icons/search-icon.png" />
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
	              <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-[color:var(--sage)] text-white">
	                <img alt="" className="size-full object-cover" src="/icons/profile-avatar-placeholder.png" />
	              </div>
            </div>
          </header>

	          <div className="grid max-w-full gap-5 overflow-hidden px-4 py-2 sm:px-8 sm:py-5 2xl:grid-cols-[1fr_350px]">
            <div className="flex flex-col gap-5">
              {activeView === "home" ? (
	              <section className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(142px,0.95fr)] items-center gap-4 sm:block">
                <div>
                  <h1 className="max-w-4xl break-words font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight sm:text-5xl">
                    welcome back, Kourtney
                  </h1>
                  <p className="mt-4 text-lg leading-8 sm:mt-2">
                    Let&apos;s <span className="font-semibold text-[color:var(--rose-deep)]">create</span>, plan, and stay consistent.
                  </p>
                </div>

		                <div className="min-h-40 rounded-2xl border border-[color:var(--line)] bg-[linear-gradient(135deg,#a45166,#ead5d1)] p-5 text-white shadow-sm sm:hidden">
		                  <p className="max-w-28 text-2xl leading-snug">small steps create big content.</p>
		                  <div className="mt-5 grid h-12 w-full place-items-center rounded-lg border border-white/35 bg-white/20">
		                    <img alt="" className="size-full object-cover opacity-0" src="/images/small-steps-card.png" />
		                  </div>
		                </div>

			                <div className="col-span-2 mt-5 flex min-w-0 flex-col gap-5 xl:grid xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)]">
			                  <div className="order-1 grid min-w-0 grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3">
		                    {metrics.map((metric) => (
		                      <article key={metric.label} className="min-w-0 rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-3 shadow-sm sm:p-4">
		                        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3 xl:flex-col xl:items-start">
		                          <IconSlot tone={metric.tone} />
		                          <div className="min-w-0">
			                            <p className="text-xs font-semibold uppercase leading-4 tracking-wide text-[color:var(--rose-deep)] sm:text-sm">{metric.label}</p>
		                            <p className="text-2xl font-semibold sm:text-3xl">{metric.value}</p>
		                            <p className="text-xs leading-4 text-[color:var(--sage)] sm:text-sm">{metric.note}</p>
		                          </div>
		                        </div>
		                      </article>
		                    ))}
		                  </div>

				                  <Panel className="order-2 !bg-[#4f503f] !text-[#fffdf9]">
			                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/20 pb-4">
			                      <div>
			                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8d7c5]">Leaderboard</p>
			                        <h2 className="mt-1 text-lg font-semibold text-white">Top Products Sold</h2>
			                      </div>
			                      <span className="text-sm text-[#f1dfcc]">{topProducts.length} ranked</span>
			                    </div>
		                    <div className="space-y-1">
		                      {topProducts.length ? (
		                        topProducts.map((product, index) => (
			                          <article key={product.id} className="grid min-w-0 grid-cols-[auto_1fr] gap-3 border-b border-white/20 py-3 last:border-b-0 sm:grid-cols-[auto_1fr_minmax(96px,180px)_auto] sm:items-center">
			                            <CategoryIcon category={product.category} />
			                            <div className="min-w-0">
			                              <p className="truncate text-sm font-semibold text-white">{product.name}</p>
			                              <p className="text-xs text-[#ead8c5]">
			                                #{index + 1} · {product.brand || "No brand"} · {normalizeProductCategory(product.category)}
			                              </p>
			                            </div>
			                            <div className="col-span-2 h-2 rounded-full bg-white/25 sm:col-span-1">
			                              <div
			                                className="h-full rounded-full bg-[#f1dfcc]"
			                                style={{ width: `${topProductMaxUnits ? Math.max((product.unitsSold / topProductMaxUnits) * 100, 8) : 0}%` }}
			                              />
			                            </div>
			                            <span className="justify-self-end rounded-full bg-white/20 px-3 py-1 text-xs text-white sm:justify-self-auto">
			                              {product.unitsSold} sold
			                            </span>
		                          </article>
		                        ))
		                      ) : (
		                        <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
		                          <p>No product sales saved yet.</p>
		                          <p className="mt-1 text-[color:var(--sand)]">Add units sold in Product Bank to see top products.</p>
		                        </div>
		                      )}
		                    </div>
		                  </Panel>
		                </div>
	              </section>
              ) : (
                <section className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-5 shadow-sm">
                  <p className="text-sm text-[color:var(--sage)]">Creator workspace</p>
                  <h1 className="mt-1 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight">
                    {viewDetails[activeView].title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-[color:var(--muted)]">{viewDetails[activeView].subtitle}</p>
                </section>
              )}

              {activeView === "tasks" ? (
	                <div className="order-1 min-w-0 space-y-4">
	                  <div className="max-w-full overflow-x-auto pb-1">
	                    <div className="flex w-max gap-2 pr-1">
                    {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
                      const date = addDays(new Date(), offset);
                      const key = getDateKey(date);
                      const isActive = key === selectedDate;
                      const hasItems = Boolean(data.dailyProducts[key]?.length);
                      return (
                        <button
                          key={key}
                          className={`min-w-14 rounded-xl border px-3 py-2 text-center transition ${
                            isActive
                              ? "border-[color:var(--sage)] bg-[color:var(--sage)] text-white"
                              : "border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--muted)]"
                          }`}
                          onClick={() => setSelectedDate(key)}
                          type="button"
                        >
                          <span className="block text-[10px] uppercase tracking-wide">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="block text-xl font-semibold leading-none">{date.getDate()}</span>
                          <span className={`mx-auto mt-1 block size-1.5 rounded-full ${hasItems ? "bg-[color:var(--rose-deep)]" : "bg-transparent"}`} />
                        </button>
                      );
	                    })}
	                    </div>
	                  </div>

                  <Panel>
                    <div className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm text-[color:var(--sage)]">{readableDate(selectedDate)}</p>
                        <h2 className="mt-1 text-2xl font-semibold">Product Queue</h2>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">
                          {completedToday}/{todaysProducts.length} products complete
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm" onClick={() => setSelectedDate(getDateKey(new Date()))} type="button">
                          Today
                        </button>
                        <button className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm" onClick={() => setData((current) => ({ ...current }))} type="button">
                          Refresh
                        </button>
                        <button className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--rose-deep)]" onClick={restartSelectedDay} type="button">
                          Restart
                        </button>
                      </div>
                    </div>

                    <form className="mt-4 grid gap-3" onSubmit={addDailyProduct}>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setDailyProductName(event.target.value)}
                          placeholder="Product name"
                          value={dailyProductName}
                        />
                        <input
                          className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setDailyProductBrand(event.target.value)}
                          placeholder="Brand"
                          value={dailyProductBrand}
                        />
                        <input
                          className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
                          onChange={(event) => setDailyProductLink(event.target.value)}
                          placeholder="Product link"
                          value={dailyProductLink}
                        />
                      </div>
                      <textarea
                        className="min-h-24 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 py-2 outline-none focus:border-[color:var(--sage)]"
                        onChange={(event) => setDailyProductScript(event.target.value)}
                        placeholder="Paste or write the script for this product..."
                        value={dailyProductScript}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                          <input checked={dailySaveProduct} onChange={(event) => setDailySaveProduct(event.target.checked)} type="checkbox" />
                          Save to Product Bank
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                          <input checked={dailySaveScript} onChange={(event) => setDailySaveScript(event.target.checked)} type="checkbox" />
                          Save script to Script Vault
                        </label>
                        <button className="ml-auto rounded-lg bg-[color:var(--sage)] px-4 py-2 text-sm font-semibold text-white" type="submit">
                          + Add Product
                        </button>
                      </div>
                    </form>
                  </Panel>

	                  <Panel>
	                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {dailyBrands.map((brand) => (
                          <button
                            key={brand}
                            className={`rounded-full border px-3 py-1.5 text-sm ${
                              dailyBrandFilter === brand
                                ? "border-[color:var(--sage)] bg-[color:var(--sage)] text-white"
                                : "border-[color:var(--line)] bg-white/60 text-[color:var(--muted)]"
                            }`}
                            onClick={() => setDailyBrandFilter(brand)}
                            type="button"
                          >
                            {brand === "All" ? "All Brands" : brand}
                          </button>
                        ))}
                      </div>
                      <select
                        className="h-10 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 text-sm outline-none"
                        onChange={(event) => setDailySort(event.target.value as typeof dailySort)}
                        value={dailySort}
                      >
                        <option value="original">Original</option>
                        <option value="brand">Brand A-Z</option>
                        <option value="remaining">Remaining first</option>
                        <option value="done">Completed first</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {visibleDailyProducts.length ? (
                        visibleDailyProducts.map((product) => (
                          <article key={product.id} className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-white/60">
                            <div className="flex flex-col gap-3 bg-[color:var(--cream)] p-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{product.productName}</h3>
                                <p className="text-sm uppercase tracking-wide text-[color:var(--muted)]">{product.brand || "No brand"}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {product.link ? (
                                  <a className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-sm" href={product.link} rel="noreferrer" target="_blank">
                                    Open
                                  </a>
                                ) : null}
                                <button
                                  className={`rounded-lg px-3 py-1.5 text-sm ${product.done ? "bg-[color:var(--sage)] text-white" : "border border-[color:var(--line)]"}`}
                                  onClick={() => updateDailyProduct(product.id, { done: !product.done })}
                                  type="button"
                                >
                                  {product.done ? "Done" : "Mark Done"}
                                </button>
                                <button className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-sm text-[color:var(--rose-deep)]" onClick={() => removeDailyProduct(product.id)} type="button">
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Script</span>
                                <button className="text-xs text-[color:var(--sage)]" onClick={() => saveDailyScriptToVault(product)} type="button">
                                  Save to Script Vault
                                </button>
                              </div>
                              <textarea
                                className="min-h-28 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm leading-6 outline-none focus:border-[color:var(--sage)]"
                                onChange={(event) => updateDailyProduct(product.id, { script: event.target.value })}
                                placeholder="Paste or write your script here..."
                                value={product.script}
                              />
                            </div>
                          </article>
                        ))
                      ) : (
                        <EmptyState label="Nothing scheduled for this day." action="Add a product to build your filming queue." />
                      )}
	                    </div>
	                  </Panel>

		                </div>
		              ) : null}

	              {activeView !== "home" && activeView !== "tasks" && activeView !== "tracker" ? (
              <div ref={formPanelRef} className="order-1 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                            onChange={(event) => setProductBrand(event.target.value)}
                            placeholder="Brand"
                            value={productBrand}
                          />
	                          <select
	                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
	                            onChange={(event) => setProductCategory(event.target.value)}
	                            value={productCategory}
	                          >
	                            {productCategories.map((category) => (
	                              <option key={category} value={category}>
	                                {category}
	                              </option>
	                            ))}
	                          </select>
                        </div>
	                        <div className="grid gap-3 sm:grid-cols-2">
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
	                          <input
	                            className="h-11 rounded-lg border border-[color:var(--line)] bg-white/80 px-3 outline-none focus:border-[color:var(--sage)]"
	                            inputMode="numeric"
	                            onChange={(event) => setProductUnitsSold(event.target.value)}
	                            placeholder="Units sold"
	                            value={productUnitsSold}
	                          />
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

	                <section className="hidden min-h-64 rounded-xl border border-[color:var(--line)] bg-[linear-gradient(135deg,#a45166,#ead5d1)] p-7 text-white shadow-sm sm:block">
	                  <p className="max-w-48 text-3xl leading-snug">small steps create big content.</p>
	                  <div className="mt-8 grid h-24 w-full place-items-center rounded-lg border border-white/35 bg-white/20">
	                    <img alt="" className="size-full object-cover opacity-0" src="/images/small-steps-card.png" />
	                  </div>
		                </section>
	              </div>
	              ) : null}

	              {activeView === "tracker" ? (
	                <div className="order-2">
	                  <Panel>
	                    <SectionHeader title="Content Tracker" count={data.content.length} />
	                    <div className="space-y-3">
	                      {data.content.length ? (
	                        data.content.map((item) => (
	                          <article key={item.id} className="rounded-xl border border-[color:var(--line)] bg-white/60 p-3">
	                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
	                              <div className="min-w-0">
	                                <h3 className="truncate text-base font-semibold">{item.productName}</h3>
	                                <p className="text-xs uppercase tracking-wide text-[color:var(--muted)]">{item.brand || "No brand"}</p>
	                              </div>
	                              <button
	                                className="self-start rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--rose-deep)]"
	                                onClick={() => deleteItem("content", item.id)}
	                                type="button"
	                              >
	                                Remove
	                              </button>
	                            </div>
	                            <div className="mt-3 grid gap-2 md:grid-cols-4">
	                              <select
	                                className="h-10 min-w-0 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm outline-none focus:border-[color:var(--sage)]"
	                                onChange={(event) => updateContentItem(item.id, { type: event.target.value })}
	                                value={item.type}
	                              >
	                                <option value="">Type</option>
	                                {contentTypes.map((type) => (
	                                  <option key={type} value={type}>
	                                    {type}
	                                  </option>
	                                ))}
	                              </select>
	                              <input
	                                className="h-10 min-w-0 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm outline-none focus:border-[color:var(--sage)]"
	                                inputMode="numeric"
	                                onChange={(event) => updateContentItem(item.id, { views48: event.target.value })}
	                                placeholder="48-hour views"
	                                value={item.views48}
	                              />
	                              <select
	                                className="h-10 min-w-0 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm outline-none focus:border-[color:var(--sage)]"
	                                onChange={(event) => updateContentItem(item.id, { gotSales: event.target.value as ContentItem["gotSales"] })}
	                                value={item.gotSales}
	                              >
	                                <option>Unknown</option>
	                                <option>Yes</option>
	                                <option>No</option>
	                              </select>
	                              <input
	                                className="h-10 min-w-0 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm outline-none focus:border-[color:var(--sage)]"
	                                onChange={(event) => updateContentItem(item.id, { datePosted: event.target.value })}
	                                type="date"
	                                value={item.datePosted}
	                              />
	                            </div>
	                            {item.script ? (
	                              <p className="mt-3 max-h-24 overflow-hidden rounded-lg bg-[color:var(--cream)]/70 p-3 text-sm leading-6 text-[color:var(--muted)]">
	                                {item.script}
	                              </p>
	                            ) : null}
	                          </article>
	                        ))
	                      ) : (
	                        <EmptyState label="No completed content tracked yet." action="Mark a product done in Daily To Do and it will appear here." />
	                      )}
	                    </div>
	                  </Panel>
	                </div>
	              ) : null}

		              {activeView === "home" ? (
	              <div className="order-2 grid gap-5 xl:grid-cols-2">
	                <Panel>
	                  <SectionHeader title="Today's Content" count={todaysProducts.length} />
	                  <div className="space-y-2">
	                    {todaysProducts.length ? (
	                      todaysProducts.slice(0, 5).map((product) => (
	                        <div key={product.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 px-3 py-2">
	                          <button
	                            className={`size-4 shrink-0 rounded border ${product.done ? "border-[color:var(--sage)] bg-[color:var(--sage)]" : "border-[color:var(--muted)]"}`}
	                            onClick={() => updateDailyProduct(product.id, { done: !product.done })}
	                            type="button"
	                            aria-label="Mark content complete"
	                          />
	                          <span className={`min-w-0 flex-1 truncate text-sm ${product.done ? "text-[color:var(--muted)] line-through" : ""}`}>
	                            {product.productName}
	                          </span>
	                          <span className="shrink-0 rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs text-[color:var(--rose-deep)]">
	                            {product.done ? "Done" : "Planned"}
	                          </span>
	                        </div>
	                      ))
	                    ) : (
	                      <EmptyState label="No content scheduled yet." action="Add a product to start planning today." />
	                    )}
	                  </div>
	                  <button
	                    className="mt-3 flex h-12 w-full items-center justify-center rounded-lg bg-[color:var(--sage)] text-base font-semibold text-white"
	                    onClick={() => handleViewChange("tasks")}
	                    type="button"
	                  >
	                    + Add Product
	                  </button>
	                </Panel>

		                {activeView === "home" ? (
		                <Panel className="!border-[#d9a9a5] !bg-[#f1dfdc]">
		                  <SectionHeader title="Recent Scripts" count={filtered.scripts.length} actionLabel="+ New Script" onAction={() => startAdd("script")} />
	                  <div className="space-y-3">
	                    {filtered.scripts.length ? (
	                      filtered.scripts.slice(0, 4).map((script) => (
	                        <article key={script.id} className="flex gap-3 rounded-lg border border-[#d9a9a5] bg-white/70 p-3">
                          <IconSlot tone="neutral" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{script.title}</p>
                            <p className="text-xs text-[color:var(--muted)]">{script.product} · {script.status}</p>
                          </div>
                          <div className="hidden shrink-0 gap-2 text-xs sm:flex">
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
                ) : null}
              </div>
              ) : null}

              {(activeView === "home" || activeView === "hooks" || activeView === "products") ? (
              <div className="order-3 grid gap-5 xl:grid-cols-2">
	                {(activeView === "home" || activeView === "hooks") ? (
	                <Panel>
	                  <SectionHeader
	                    title={activeView === "hooks" ? "Hook Bank" : "Recent Hooks"}
	                    count={filtered.hooks.length}
	                    actionLabel="+ New Hook"
	                    onAction={() => startAdd("hook")}
	                  />
                  <div className="space-y-3">
                    {filtered.hooks.length ? (
                      filtered.hooks.slice(0, activeView === "hooks" ? undefined : 4).map((hook) => (
                        <div key={hook.id} className="flex items-center gap-3 rounded-lg bg-[color:var(--sage-soft)] px-3 py-2">
                          <IconSlot tone="sage" />
                          <p className="min-w-0 flex-1 truncate text-sm">{hook.text}</p>
                          <span className="rounded-full bg-white/50 px-3 py-1 text-xs">{hook.tag}</span>
                          <button className="hidden text-xs text-[color:var(--sage)] sm:inline" onClick={() => startEdit("hook", hook.id)} type="button">
                            Edit
                          </button>
                          <button className="hidden text-xs text-[color:var(--rose-deep)] sm:inline" onClick={() => deleteItem("hook", hook.id)} type="button">
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState label="No hooks saved yet." action="Save hook ideas as they come to you." />
                    )}
                  </div>
                </Panel>
                ) : null}

		                {(activeView === "home" || activeView === "products") ? (
			                <Panel className={activeView === "home" ? "!border-[#d9a9a5] !bg-[#f1dfdc]" : ""}>
	                  <SectionHeader
	                    title={activeView === "products" ? "Product Bank" : "Recent Products"}
	                    count={filtered.products.length}
	                    actionLabel="+ New Product"
	                    onAction={() => startAdd("product")}
	                  />
                  <div className="space-y-2">
                    {filtered.products.length ? (
                      filtered.products.slice(0, activeView === "products" ? undefined : 4).map((product) => (
		                        <article key={product.id} className="flex items-center gap-3 rounded-lg border border-[#d9a9a5] bg-white/70 p-2">
                          <IconSlot tone="clay" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
	                            <p className="text-xs text-[color:var(--muted)]">
	                              {[product.brand, product.category, product.status].filter(Boolean).join(" · ")}
	                            </p>
	                          </div>
	                          <span className="shrink-0 rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs text-[color:var(--sage)]">
	                            {product.unitsSold} sold
	                          </span>
	                          <div className="hidden shrink-0 gap-2 text-xs sm:flex">
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
	                ) : null}
		              </div>
		              ) : null}

              {activeView === "scripts" ? (
                <div className="order-2">
                  <Panel>
                    <SectionHeader title="Script Vault" count={filtered.scripts.length} />
                    <div className="space-y-3">
                      {filtered.scripts.length ? (
                        filtered.scripts.map((script) => (
                          <article key={script.id} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--cream)]/60 p-3">
                            <div className="flex gap-3">
                              <IconSlot tone="neutral" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{script.title}</p>
                                <p className="text-xs text-[color:var(--muted)]">
                                  {script.product} · {script.status}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2 text-xs">
                                <button className="text-[color:var(--sage)]" onClick={() => startEdit("script", script.id)} type="button">
                                  Edit
                                </button>
                                <button className="text-[color:var(--rose-deep)]" onClick={() => deleteItem("script", script.id)} type="button">
                                  Delete
                                </button>
                              </div>
                            </div>
                            {script.body ? <p className="mt-3 rounded-lg bg-white/60 p-3 text-sm leading-6 text-[color:var(--muted)]">{script.body}</p> : null}
                          </article>
                        ))
                      ) : (
                        <EmptyState label="No scripts saved yet." action="Create a script draft when you have a video idea." />
                      )}
                    </div>
                  </Panel>
                </div>
              ) : null}
            </div>

	            <div className="hidden space-y-5 lg:block">
	              <Panel>
	                <div className="mb-4 flex items-center justify-between gap-3">
	                  <h2 className="text-lg font-semibold">Core 5</h2>
	                  <span className="text-sm text-[color:var(--sage)]">
	                    {data.coreBrands.filter((brand) => brand.trim()).length}/5
	                  </span>
	                </div>
	                <div className="space-y-2">
	                  {normalizeCoreBrands(data.coreBrands).map((brand, index) => (
	                    <label key={index} className="flex min-w-0 items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/60 p-2">
	                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[color:var(--cream)] text-sm font-semibold text-[color:var(--sage)]">
	                        {index + 1}
	                      </span>
	                      <input
	                        className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[color:var(--muted)]"
	                        onChange={(event) => updateCoreBrand(index, event.target.value)}
	                        placeholder="Brand name"
	                        value={brand}
	                      />
	                    </label>
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
	      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-[color:var(--line)] bg-[color:var(--paper)]/95 px-1 py-2 shadow-[0_-8px_30px_rgba(47,42,37,0.08)] backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.label}
	            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-[10px] ${
              activeView === item.view ? "text-[color:var(--rose-deep)]" : "text-[color:var(--muted)]"
            }`}
            onClick={() => handleViewChange(item.view)}
            type="button"
          >
            <IconSlot tone={activeView === item.view ? "rose" : "neutral"} />
            <span className="w-full truncate text-center">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
