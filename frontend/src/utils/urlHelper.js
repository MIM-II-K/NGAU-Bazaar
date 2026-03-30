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
export const getProductImageUrl = (url) => {
  // Use the env variable injected in Vercel/Render, fallback to Render URL if missing
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://ngau-bazaar.onrender.com";
  
  if (!url || url === "null" || url === "undefined") return "/placeholder.png";
  if (url.startsWith('http')) return url;

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  let path = url.replace(/^\/+/, '').replace(/^static\//, '');
  
  // Normalize based on your Supabase bucket structure
  if (!path.includes('product-images/')) {
    path = `product-images/${path}`;
  }

  return `${cleanBase}/static/${path}`;
};