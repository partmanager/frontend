import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "boot/axios";

export const useUsersStore = defineStore("UsersStore", {
  state: () => ({
    users: [],
    me: {},
    settings: {
      invoices: {
        invoiceDetailPage: {
          visibleColumns: [
            "position",
            "order_number",
            "bookkeeping",
            "description",
            "manufacturer",
            "manufacturer_order_number",
            "distributor_order_number",
            "quantity_ordered",
            "quantity_shipped",
            "quantity_delivered",
            "quantity_unit",
            "unit_price",
            "local_price",
            "stock_quantity",
            "stock_value",
            "stock_location",
          ],
        },
        invoiceItemsPage: { visibleColumns: [] },
      },
    },
  }),
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId);
    },
    getMe: (state) => state.me,
  },
  actions: {
    async fetchData() {
      api
        .get("whoami")
        .then((response) => {
          this.me = response.data;

          api.get(`/api/user/`).then((response) => {
            this.users = response.data.results;
          });
        })
        .catch(() => {
          //this.router.push("/login");
        });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
