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

  const baseUrl = import.meta.env.VITE_API_URL; // Using your actual .env key
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Extract ONLY the filename (the uuid.jpg) no matter what junk is in the path
  const fileName = path.split('/').pop(); 

  // Reconstruct the path exactly how your working pages do it
  return `${cleanBase}/static/product-images/${fileName}`;
};