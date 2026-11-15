import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  addCategory,
  createUploadUrls,
  deleteCatalog,
  deleteCategory,
  saveCatalog,
  verifyAdmin,
} from "@/lib/catalog.functions";
import { catalogsQuery } from "./index";
import { ConnectionSettings } from "@/components/ConnectionSettings";
import { ADMIN_EMAIL, maskEmail } from "@/lib/admin-email";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — مكتبة كتالوجات رافال" },
      { name: "description", content: "إدارة الكتالوجات والأقسام." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة الإدارة" },
      { property: "og:description", content: "إدارة الكتالوجات والأقسام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const field = "w-full rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary";

function AdminPage() {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  const verify = useServerFn(verifyAdmin);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return alive && setState("out");
      try {
        await verify();
        if (alive) setState("in");
      } catch {
        await supabase.auth.signOut();
        if (alive) setState("out");
      }
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void check();
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [verify]);

  if (state === "loading")
    return <main className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></main>;
  if (state === "out") return <AdminLogin />;
  return <Dashboard />;
}

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    setBusy(false);
    if (error) toast.error("كلمة السر غير صحيحة");
  }

  async function forgot() {
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error("تعذر إرسال الرسالة، حاول بعد قليل");
    else toast.success(`أرسلنا رابط تغيير كلمة السر إلى ${maskEmail(ADMIN_EMAIL)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={signIn} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold">دخول الإدارة</h1>
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة السر" aria-label="كلمة السر" className={field} />
        <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">دخول</button>
        <button type="button" disabled={busy} onClick={forgot} className="w-full text-sm text-primary">نسيت كلمة السر؟</button>
      </form>
    </main>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 6) return toast.error("كلمة السر الجديدة يجب أن تكون 6 أحرف أو أرقام على الأقل");
    if (next !== confirmPw) return toast.error("كلمتا السر غير متطابقتين");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current } as { password: string });
    setBusy(false);
    if (error) return toast.error(/current|incorrect|invalid/i.test(error.message) ? "كلمة السر الحالية غير صحيحة" : "تعذر تغيير كلمة السر");
    setCurrent(""); setNext(""); setConfirmPw("");
    toast.success("تم تغيير كلمة السر");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">تغيير كلمة السر</h2>
      <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="كلمة السر الحالية" aria-label="كلمة السر الحالية" className={field} />
      <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="كلمة السر الجديدة" aria-label="كلمة السر الجديدة" className={field} />
      <input type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="تأكيد كلمة السر الجديدة" aria-label="تأكيد كلمة السر الجديدة" className={field} />
      <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">حفظ كلمة السر</button>
    </form>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const { data } = useQuery(catalogsQuery);
  const getUrls = useServerFn(createUploadUrls);
  const save = useServerFn(saveCatalog);
  const del = useServerFn(deleteCatalog);
  const addCat = useServerFn(addCategory);
  const delCat = useServerFn(deleteCategory);
  const refresh = () => qc.invalidateQueries({ queryKey: ["catalogs"] });

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("ar");
  const [status, setStatus] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) { toast.error("اختر ملف PDF واكتب الاسم"); return; }
    try {
      setStatus("جارٍ قراءة الكتالوج...");
      const { extractPdf } = await import("@/lib/pdf-extract");
      const { pages, cover, pageCount } = await extractPdf(file);
      setStatus("جارٍ رفع الملف...");
      const u = await getUrls();
      const store = supabase.storage.from("catalogs");
      const r1 = await store.uploadToSignedUrl(u.filePath, u.fileToken, file, { contentType: "application/pdf" });
      if (r1.error) throw r1.error;
      const r2 = await store.uploadToSignedUrl(u.coverPath, u.coverToken, cover, { contentType: "image/jpeg" });
      setStatus("جارٍ الحفظ...");
      await save({
        data: {
          title: title.trim(),
          description: desc.trim(),
          keywords: keywords.trim(),
          category_id: categoryId || null,
          language,
          file_path: u.filePath,
          cover_path: r2.error ? null : u.coverPath,
          page_count: pageCount,
          pages,
        },
      });
      toast.success(pages.length ? "تمت الإضافة بنجاح" : "تمت الإضافة — تنبيه: الملف صور بلا نص، المساعد لن يقرأ محتواه");
      setFile(null);
      setTitle("");
      setDesc("");
      setKeywords("");
      (e.target as HTMLFormElement).reset();
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("فشل الرفع");
    } finally {
      setStatus(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-28 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-primary">عرض الموقع</Link>
          <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground">تسجيل الخروج</button>
        </div>
      </div>

      <ConnectionSettings />

      <ChangePassword />

      <form onSubmit={upload} className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">إضافة كتالوج</h2>
        <input type="file" accept="application/pdf" onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f && !title) setTitle(f.name.replace(/\.pdf$/i, ""));
        }} className={field} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم الكتالوج (مثال: كتالوج رافال 2026)" className={field} />
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="كلمات بديلة (مثال: سوليز، solis، 50 كيلو)" className={field} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف مختصر (اختياري)" rows={2} className={field} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={field}>
          <option value="">بدون قسم</option>
          {data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="لغة الكتالوج" className={field}>
          <option value="ar">عربي</option>
          <option value="en">English</option>
        </select>
        <button disabled={!!status} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {status ? <><Loader2 className="h-5 w-5 animate-spin" /> {status}</> : <><Upload className="h-5 w-5" /> رفع الكتالوج</>}
        </button>
      </form>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">الأقسام</h2>
        <form className="flex gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!newCat.trim()) return;
          await addCat({ data: { name: newCat } });
          setNewCat("");
          refresh();
        }}>
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="اسم القسم (مثال: انفرترات)" className={field} />
          <button className="rounded-xl bg-primary px-5 text-primary-foreground">إضافة</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {data?.categories.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
              {c.name}
              <button onClick={async () => { if (confirm(`حذف قسم ${c.name}؟`)) { await delCat({ data: { id: c.id } }); refresh(); } }} aria-label="حذف">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">الكتالوجات ({data?.catalogs.length ?? 0})</h2>
        {data?.catalogs.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0">
            <Link to="/catalog/$id" params={{ id: c.id }} className="truncate hover:text-primary">{c.title} <span className="text-xs text-muted-foreground">({c.language === "en" ? "EN" : "عربي"})</span></Link>
            <button onClick={async () => { if (confirm(`حذف ${c.title}؟`)) { await del({ data: { id: c.id } }); refresh(); } }} aria-label="حذف">
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
