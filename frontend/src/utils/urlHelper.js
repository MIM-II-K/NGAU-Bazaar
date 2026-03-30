export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") 
    .replace(/[\s_-]+/g, "-") 
    .replace(/^-+|-+$/g, ""); 
};

export const getProductImageUrl = (url, baseUrl = "https://ngau-bazaar.onrender.com") => {
  if (!url || url === "null" || url === "undefined") return "/placeholder.png";
  if (url.startsWith('http')) return url;

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // 1. Strip leading slashes and any existing "static/" prefix to normalize
  let path = url.replace(/^\/+/, '').replace(/^static\//, '');
  
  // 2. If it's just a filename (e.g., "kiwi.jpg"), ensure "product_images/" is added
  // If your DB already stores "product_images/kiwi.jpg", this won't double it.
  if (!path.includes('product_images/')) {
    path = `product_images/${path}`;
  }

  // 3. Return the fully qualified Render URL
  return `${cleanBase}/static/${path}`;
};