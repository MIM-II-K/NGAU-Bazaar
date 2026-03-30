export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// utils/urlHelper.js
export const getProductImageUrl = (path) => {
  if (!path || path === "null" || path === "undefined")
    return "/placeholder.png";

  // If it's already a full URL, don't touch it
  if (path.startsWith("http")) return path;

  // 1. Get your API Base (Render URL)
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://ngau-bazaar.onrender.com";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // 2. Clean the path
  let fileName = path
    .replace(/^\/+/, "")
    .replace(/^static\//, "")
    .replace(/^product-images\//, "");

  /**
   * IMPORTANT:
   * If your Shop page works, it's because it hits a specific URL.
   * If your FastAPI is serving as a proxy to Supabase:
   * use: `${cleanBase}/static/product-images/${fileName}`
   * * If you want to hit Supabase directly (faster):
   * use: `https://[YOUR_PROJECT_ID].supabase.co/storage/v1/object/public/product-images/${fileName}`
   */

  return `${cleanBase}/static/product-images/${fileName}`;
};
