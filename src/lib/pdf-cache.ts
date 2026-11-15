// Browser-only helpers: catalog info memo + PDF bytes cached on the device (keyed by catalog id,
// because signed file URLs change every time).
import { useEffect, useState } from "react";
import { getCatalog } from "@/lib/catalog.functions";

type Cat = Awaited<ReturnType<typeof getCatalog>>;
const infoMemo = new Map<string, Promise<Cat>>();
const bytesMemo = new Map<string, Promise<ArrayBuffer>>();
const CACHE = "rafal-catalog-pdfs-v1";

export function loadCatalogInfo(id: string, fetcher: (a: { data: { id: string } }) => Promise<Cat>) {
  let p = infoMemo.get(id);
  if (!p) {
    p = fetcher({ data: { id } })
      .then((c) => {
        try { if (c) localStorage.setItem(`rafal-cat-info:${id}`, JSON.stringify(c)); } catch {}
        return c;
      })
      .catch((e) => {
        infoMemo.delete(id);
        const saved = localStorage.getItem(`rafal-cat-info:${id}`);
        if (saved) return JSON.parse(saved) as Cat;
        throw e;
      });
    infoMemo.set(id, p);
  }
  return p;
}

export function loadPdfBytes(id: string, url: string): Promise<ArrayBuffer> {
  let p = bytesMemo.get(id);
  if (!p) {
    p = (async () => {
      const key = `/__catalog/${id}`;
      const cache = "caches" in window ? await caches.open(CACHE).catch(() => null) : null;
      const hit = await cache?.match(key);
      if (hit) return hit.arrayBuffer();
      if (!url) throw new Error("offline");
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const buf = await res.arrayBuffer();
      cache
        ?.put(key, new Response(buf.slice(0), { headers: { "content-type": "application/pdf" } }))
        .then(() => window.dispatchEvent(new Event("saved-changed")))
        .catch(() => {});
      return buf;
    })().catch((e) => {
      bytesMemo.delete(id);
      throw e;
    });
    bytesMemo.set(id, p);
  }
  return p;
}

export function prefetchCatalog(id: string, fetcher: (a: { data: { id: string } }) => Promise<Cat>) {
  loadCatalogInfo(id, fetcher)
    .then((c) => (c?.file_url ? loadPdfBytes(id, c.file_url) : undefined))
    .catch(() => {});
}

const RECENT = "rafal-recent-catalogs";
export function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT) || "[]");
  } catch {
    return [];
  }
}
export function pushRecent(id: string) {
  const list = [id, ...getRecent().filter((x) => x !== id)].slice(0, 4);
  localStorage.setItem(RECENT, JSON.stringify(list));
  window.dispatchEvent(new Event("recent-changed"));
}

export async function isPdfSaved(id: string) {
  if (!("caches" in window)) return false;
  const cache = await caches.open(CACHE);
  return !!(await cache.match(`/__catalog/${id}`));
}

/** Ids of every catalog whose PDF is saved on this device. */
export async function listSaved(): Promise<Set<string>> {
  if (!("caches" in window)) return new Set();
  const cache = await caches.open(CACHE).catch(() => null);
  const keys = (await cache?.keys()) ?? [];
  return new Set(keys.map((r) => new URL(r.url).pathname.replace("/__catalog/", "")));
}

/** Saves one catalog on the device so it opens without internet. */
export async function saveCatalog(id: string, fetcher: (a: { data: { id: string } }) => Promise<Cat>) {
  const c = await loadCatalogInfo(id, fetcher);
  if (!c?.file_url) throw new Error("no file");
  await loadPdfBytes(id, c.file_url);
  window.dispatchEvent(new Event("saved-changed"));
}

/** Removes one saved catalog from the device to free space. */
export async function removeSaved(id: string) {
  bytesMemo.delete(id);
  if ("caches" in window) await (await caches.open(CACHE)).delete(`/__catalog/${id}`);
  window.dispatchEvent(new Event("saved-changed"));
}

export function useSavedIds() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const sync = () => listSaved().then(setIds).catch(() => {});
    sync();
    window.addEventListener("saved-changed", sync);
    return () => window.removeEventListener("saved-changed", sync);
  }, []);
  return ids;
}

let downloading = false;
/** Saves every catalog PDF on the device, one after another, so all of them open without internet. */
export async function downloadAll(
  ids: string[],
  fetcher: (a: { data: { id: string } }) => Promise<Cat>,
  onProgress: (done: number, total: number) => void,
) {
  if (downloading || !("caches" in window)) return;
  downloading = true;
  let done = 0;
  try {
    for (const id of ids) {
      try {
        if (!(await isPdfSaved(id))) {
          const c = await loadCatalogInfo(id, fetcher);
          if (c?.file_url) await loadPdfBytes(id, c.file_url);
        } else {
          await loadCatalogInfo(id, fetcher).catch(() => null);
        }
        done++;
      } catch {
        if (!navigator.onLine) break;
      }
      onProgress(done, ids.length);
    }
  } finally {
    downloading = false;
  }
}
