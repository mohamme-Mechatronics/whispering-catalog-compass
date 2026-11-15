import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تعيين كلمة سر جديدة — إدارة رافال" },
      { name: "description", content: "تعيين كلمة سر جديدة لحساب إدارة مكتبة كتالوجات رافال." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "تعيين كلمة سر جديدة" },
      { property: "og:description", content: "تعيين كلمة سر جديدة لحساب الإدارة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

const field = "w-full rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary";

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The link from the email signs the admin in for a password change only.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setTimeout(() => setChecked(true), 1500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) { toast.error("كلمة السر يجب أن تكون 6 أحرف أو أرقام على الأقل"); return; }
    if (pw !== pw2) { toast.error("كلمتا السر غير متطابقتين"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error("تعذر حفظ كلمة السر، اطلب رابطاً جديداً"); return; }
    toast.success("تم تغيير كلمة السر");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold">تعيين كلمة سر جديدة</h1>
        {ready ? (
          <form onSubmit={submit} className="space-y-3">
            <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="كلمة السر الجديدة" aria-label="كلمة السر الجديدة" className={field} />
            <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="تأكيد كلمة السر" aria-label="تأكيد كلمة السر" className={field} />
            <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">حفظ</button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            {checked ? "الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من صفحة الإدارة." : "جارٍ التحقق من الرابط..."}
          </p>
        )}
      </div>
    </main>
  );
}
