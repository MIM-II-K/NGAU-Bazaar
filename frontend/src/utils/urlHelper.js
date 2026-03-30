export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getProductImageUrl = (path, fallbackBase = "") => {
  if (!path || path === "null" || path === "undefined") return "/placeholder.png";
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL || fallbackBase || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const fileName = path.split('/').pop();

  return cleanBase
    ? `${cleanBase}/static/product-images/${fileName}`
    : "/placeholder.png"; // ← don't return a broken relative path
};