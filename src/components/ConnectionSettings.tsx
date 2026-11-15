import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_APP_URL, getSavedAppUrl, normalizeUrl, saveAppUrl } from "@/lib/app-url";

const field = "w-full rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary";

export function ConnectionSettings() {
  const [current, setCurrent] = useState(DEFAULT_APP_URL);
  const [url, setUrl] = useState(DEFAULT_APP_URL);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = getSavedAppUrl();
    setCurrent(s);
    setUrl(s);
  }, []);

  async function test(): Promise<string | null> {
    const u = normalizeUrl(url);
    if (!u) { toast.error("الرابط غير صحيح"); return null; }
    setBusy(true);
    try {
      await fetch(u + "/manifest.webmanifest", { mode: "no-cors", cache: "no-store" });
      toast.success("الاتصال ناجح");
      return u;
    } catch {
      toast.error("تعذّر الاتصال بهذا الرابط");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const u = await test();
    if (!u) return;
    saveAppUrl(u);
    setCurrent(u);
    toast.success("تم الحفظ — جارٍ التحديث...");
    setTimeout(() => {
      if (u === window.location.origin) window.location.reload();
      else window.location.href = u + "/admin";
    }, 800);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">إعدادات الاتصال</h2>
      <p className="text-sm text-muted-foreground">رابط واجهة التطبيق الحالي:</p>
      <p dir="ltr" className="break-all text-left font-mono text-sm">{current}</p>
      <input dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." aria-label="رابط واجهة التطبيق" className={field + " font-mono"} />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy} onClick={test} className="rounded-xl border border-border py-3 font-semibold disabled:opacity-60">اختبار الاتصال</button>
        <button type="button" disabled={busy} onClick={save} className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">حفظ وتحديث</button>
      </div>
      <button type="button" onClick={() => setUrl(DEFAULT_APP_URL)} className="w-full rounded-xl border border-border py-3">استعادة الرابط الافتراضي</button>
    </section>
  );
}
