import api from "./axios";

const productValue = (payload) => {
  let value = payload;
  for (let depth = 0; depth < 4 && value && typeof value === "object"; depth += 1) {
    if (value.product && typeof value.product === "object") {
      value = value.product;
      continue;
    }
    if (value.data && typeof value.data === "object") {
      value = value.data;
      continue;
    }
    break;
  }
  return value;
};

export const getProductId = (product) => {
  const value = productValue(product);
  return Number(value?.id ?? value?.product_id ?? value?.productId);
};

export const normalizeProduct = (payload) => {
  const product = productValue(payload) || {};
  const id = getProductId(product);

  return {
    ...product,
    ...(Number.isInteger(id) && id > 0 ? { id } : {}),
    price: Number(product.base_price ?? product.price ?? 0),
    category: product.category?.name || product.category || "Product",
    brand: product.brand || null,
    variants: Array.isArray(product.variants)
      ? product.variants
      : Array.isArray(product.product_variants)
        ? product.product_variants
        : [],
  };
};

export const getProducts = async () => {
  const response = await api.get("/products");
  const payload = response.data?.data ?? response.data;
  const items = Array.isArray(payload)
    ? payload
    : payload?.products || payload?.items || [];
  return items.map(normalizeProduct);
};

export const createProduct = async (product) => {
  const response = await api.post("/admin/products", toProductPayload(product));
  return normalizeProduct(response.data.data || response.data);
};

export const updateProduct = async (id, product) => {
  const response = await api.put(
    `/admin/products/${id}`,
    toProductPayload(product),
  );
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
  await api.delete(`/admin/products/${id}`);
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return normalizeProduct(response.data);
};
