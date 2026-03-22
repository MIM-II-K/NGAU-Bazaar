import apiClient from './api';

const flashDealsApi = {
  getDeals: async () => {
    // Your interceptor handles response.data automatically
    return await apiClient.get('/flash-deals/');
  },

  updateFlashDeal: async (productId, data) => {
    return await apiClient.patch(`/flash-deals/update/${productId}`, data);
  },

  removeFlashDeal: async (productId) => {
    return await apiClient.patch(`/flash-deals/remove/${productId}`);
  }
};

export default flashDealsApi;