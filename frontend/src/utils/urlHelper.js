export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ✅ FIX: accepts an optional fallbackBase so callers like CartPage can pass
// API_BASE_URL directly, making this work even when VITE_API_URL is unset in Vercel.
export const getProductImageUrl = (path, fallbackBase = "") => {
  if (!path || path === "null" || path === "undefined") return "/placeholder.png";

  // Already a full URL (e.g. Supabase storage) — return as-is
  if (path.startsWith("http")) return path;

  // Prefer the Vite env var, then the caller-supplied fallback
  const baseUrl = import.meta.env.VITE_API_URL || fallbackBase || "";

  // Guard: if we still have no base, don't return a broken relative path
  if (!baseUrl) return "/placeholder.png";

  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Extract filename only to prevent double-nesting:
  // e.g. "static/product-images/static/product-images/photo.jpg"
  const fileName = path.split("/").pop();

  return `${cleanBase}/static/product-images/${fileName}`;
};