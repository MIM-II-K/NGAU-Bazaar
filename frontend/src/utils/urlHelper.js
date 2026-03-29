export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") 
    .replace(/[\s_-]+/g, "-") 
    .replace(/^-+|-+$/g, ""); 
};

// ADD THIS HELPER for your images
export const getProductImageUrl = (url, baseUrl = "https://ngau-bazaar.onrender.com") => {
  if (!url) return "/placeholder.png";
  if (url.startsWith('http')) return url;

  // Your main.py uses app.mount("/static", ...)
  // If your DB stores "product_images/img.jpg", we need to ensure it becomes "/static/product_images/img.jpg"
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  let cleanPath = url;
  if (!url.startsWith('/static') && !url.startsWith('static')) {
      cleanPath = `/static/${url.startsWith('/') ? url.slice(1) : url}`;
  } else {
      cleanPath = url.startsWith('/') ? url : `/${url}`;
  }

  return `${cleanBase}${cleanPath}`;
};