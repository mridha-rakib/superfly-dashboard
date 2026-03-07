import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const clientApi = {
  deleteClient: async (clientId) => {
    const response = await httpClient.delete(`/user/clients/${clientId}`);
    return unwrap(response);
  },
};
