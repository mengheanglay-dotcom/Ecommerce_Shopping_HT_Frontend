import api from "./axios";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data?.data ?? response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data?.data ?? response.data;
};
