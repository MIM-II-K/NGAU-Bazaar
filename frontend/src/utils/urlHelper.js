export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
export const getProductImageUrl = (path) => {
  if (!path || path === "null" || path === "undefined") return "/placeholder.png";
  if (path.startsWith("http")) return path;

  // FIX: Match your .env key (VITE_API_URL) and add a fallback empty string
  const baseUrl = import.meta.env.VITE_API_URL || ""; 
  
  // Safety check: only call endsWith if baseUrl actually has a value
  const cleanBase = baseUrl && baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Extract just the filename to avoid "static/product-images/static/..." nesting
  const fileName = path.split('/').pop(); 

  return `${cleanBase}/static/product-images/${fileName}`;
};