import { shareLink } from "@/components/ShareSheet";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Download, ExternalLink, Loader2, Share2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { PdfPages } from "@/components/PdfPages";
import { loadCatalogInfo, pushRecent, removeSaved, saveCatalog, useSavedIds } from "@/lib/pdf-cache";

type Cat = Awaited<ReturnType<typeof getCatalog>>;

export function CatalogViewer({ id, cover, onClose }: { id: string | null; cover?: string | null; onClose: () => void }) {
  const fetchCatalog = useServerFn(getCatalog);
  const [c, setC] = useState<Cat>(null);
  const savedIds = useSavedIds();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setC(null);
    pushRecent(id);
    loadCatalogInfo(id, fetchCatalog).then(setC).catch(() => toast.error("تعذر فتح الكتالوج"));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // Phone back button closes the viewer instead of leaving the site.
    window.history.pushState({ viewer: id }, "");
    const onPop = () => onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    document.body.style.overflow = "hidden";
    document.body.dataset["viewer"] = "open";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      if (window.history.state?.viewer === id) window.history.back();
      document.body.style.overflow = "";
      delete document.body.dataset["viewer"];
    };
  }, [id]);

  if (!id) return null;

  const share = async () => {
    const url = `${window.location.origin}/catalog/${id}`;
    await shareLink(c?.title ?? "كتالوج", url);
  };

  const saved = savedIds.has(id);
  const toggleSave = async () => {
    if (saved) {
      await removeSaved(id);
      toast("أُزيل الكتالوج من الهاتف");
      return;
    }
    setSaving(true);
    try {
      await saveCatalog(id, fetchCatalog);
      toast.success("حُفظ على الهاتف — يفتح بدون إنترنت");
    } catch {
      toast.error("تعذر الحفظ — تأكد من الاتصال بالإنترنت");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="viewer-fade fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-2 sm:p-6" onClick={onClose}>
      <div
        className="viewer-slide flex h-full max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-2 sm:p-3">
          {c?.download_url ? (
            <a href={c.download_url} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
              <Download className="h-4 w-4" /> تحميل
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-muted-foreground">
              <Download className="h-4 w-4" /> تحميل
            </span>
          )}
          <button
            onClick={toggleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${saved ? "border-primary text-primary" : "border-border hover:text-primary"}`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            {saved ? "محفوظ على الهاتف" : "حفظ على الهاتف"}
          </button>
          <button onClick={share} aria-label="مشاركة" className="rounded-xl border border-border p-2 hover:text-primary">
            <Share2 className="h-4 w-4" />
          </button>
          {c?.file_url && (
            <a href={c.file_url} target="_blank" rel="noreferrer" aria-label="فتح في نافذة جديدة" className="rounded-xl border border-border p-2 hover:text-primary">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <p className="order-last w-full truncate text-sm font-semibold sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">{c?.title}</p>
          <span className="flex-1 sm:hidden" />
          <button onClick={onClose} aria-label="إغلاق" className="rounded-xl p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-muted">
          {id ? (
            <PdfPages key={id} id={id} url={c?.id === id ? (c.file_url ?? "") : ""} cover={cover ?? null} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
