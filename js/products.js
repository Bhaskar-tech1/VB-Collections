// All products are now loaded from Supabase
const products = [];

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

// Global Supabase Integration for all pages
window.supabaseProductsLoaded = false;
window.ensureDynamicProductsLoaded = async function() {
  if (window.supabaseProductsLoaded) return;
  const SUPABASE_URL = 'https://rrdsafwfytiakupvnfok.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZHNhZndmeXRpYWt1cHZuZm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODAyNTEsImV4cCI6MjA5MTc1NjI1MX0.o-07NHCj4GUJ2W7KEZT3xb3W7ug1_gntNpUV3z_2uKg';
  
  try {
      // Fetch ALL products from Supabase (paginated to handle large datasets)
      let offset = 0;
      const LIMIT = 1000;
      let allData = [];
      
      while (true) {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc&offset=${offset}&limit=${LIMIT}`, {
              headers: {
                  'apikey': SUPABASE_ANON,
                  'Authorization': `Bearer ${SUPABASE_ANON}`
              }
          });
          if (response.ok) {
              const data = await response.json();
              allData = allData.concat(data);
              if (data.length < LIMIT) break;
              offset += LIMIT;
          } else {
              break;
          }
      }
      
      // Map and push into the global products array
      const newProducts = allData.filter(d => !products.some(p => p.id === d.id));
      const dynamic = newProducts.map(p => ({ ...p, type: 'product' }));
      products.push(...dynamic);
  } catch (e) {
      console.error('Failed to load products from Supabase', e);
  }
  window.supabaseProductsLoaded = true;
};
