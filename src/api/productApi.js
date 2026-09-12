import api from "./axios";

export const normalizeProduct = (product) => ({
  ...product,
  price: Number(product.base_price ?? product.price ?? 0),
  category: product.category?.name || product.category || "Product",
  brand: product.brand || null,
  variants: Array.isArray(product.variants) ? product.variants : [],
});

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data.data.map(normalizeProduct);
};

export const createProduct = async (product) => {
  const response = await api.post("/products", toProductPayload(product));
  return normalizeProduct(response.data.data || response.data);
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}`, toProductPayload(product));
  return normalizeProduct(response.data.data || response.data);
};

const toProductPayload = (product) => ({
  code: product.code || undefined,
  name: product.name,
  description: product.description || undefined,
  category_id: product.category_id || product.category?.id,
  brand_id: product.brand_id || product.brand?.id,
  base_price: Number(product.base_price ?? product.price ?? 0),
  image: product.image,
  status: product.status || "active",
});

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return normalizeProduct(response.data.data);
};
