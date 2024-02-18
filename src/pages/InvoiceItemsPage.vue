<template>
  <div class="q-pa-md">
    <q-table
      title="Invoices Items"
      row-key="id"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :filter="filter"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:top>
        <strong>Invoice Items</strong>
        <q-space />
        <q-checkbox
          label="Show Shipping"
          v-model="show_shipping_checkbox_model"
        ></q-checkbox>
        <q-checkbox
          label="Show Not Shipped"
          v-model="show_not_shipped_checkbox_model"
        ></q-checkbox>
        <q-space />
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-distributor_order_number="props">
        <q-td :props="props">
          <div>
            {{ props.value }}
            <q-icon
              v-if="props.row.item_type == 's'"
              name="local_shipping"
            ></q-icon>
            <q-icon
              v-if="props.row.item_type == 'v'"
              name="design_services"
            ></q-icon>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-manufacturer_order_number="props">
        <q-td :props="props">
          <div>
            {{ props.value }}
            <div v-if="!props.value">
              {{ props.row.don_mon }}
              <q-badge
                color="yellow-6"
                text-color="black"
                title="Manufacturer Order Number not assigned, displaying manufacturer order number form distributor data."
              >
                <q-icon class="q-ml-xs" name="warning"></q-icon>
              </q-badge>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-manufacturer="props">
        <q-td :props="props">
          <div>
            {{ props.value }}
            <div v-if="!props.value">
              {{ props.row.don_manufacturer }}
              <q-badge
                color="yellow-6"
                text-color="black"
                title="Manufacturer not assigned, displaying manufacturer form distributor data."
              >
                <q-icon class="q-ml-xs" name="warning"></q-icon>
              </q-badge>
            </div>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { quantity_unit_id_to_name } from "src/boot/choices.js";

const columns = [
  {
    name: "invoice",
    label: "Invoice",
    align: "left",
    field: "invoice",
    format: (val) => val.number,
  },
  {
    name: "position",
    label: "Position",
    align: "left",
    field: "position_in_invoice",
  },
  {
    name: "order_number",
    label: "Order Number",
    align: "left",
    field: "order_number",
  },
  {
    name: "distributor_order_number",
    label: "Distributor Order Number",
    align: "left",
    field: "distributor_order_number",
    format: (val) => {
      return val.don;
    },
  },
  {
    name: "manufacturer_order_number",
    label: "Manufacturer Order Number",
    align: "left",
    field: "distributor_order_number",
    format: (val) => {
      if (val)
        if (val.manufacturer_order_number) {
          return val.manufacturer_order_number.mon;
        } else {
          return val.mon;
        }
    },
  },
  {
    name: "manufacturer",
    align: "center",
    label: "Manufacturer",
    field: "distributor_order_number",
    format: (val) => {
      if (val) {
        if (val.manufacturer_order_number) {
          return val.manufacturer_order_number.manufacturer;
        } else {
          return val.manufacturer_name;
        }
      }
    },
  },
  {
    name: "quantity_ordered",
    label: "Quantity Ordered",
    field: "quantity",
    format: (val, row) => {
      if (val) {
        return val.ordered;
      }
    },
  },
  {
    name: "quantity_shipped",
    label: "Quantity Shipped",
    field: "quantity",
    format: (val, row) => {
      if (val) {
        return val.shipped;
      }
    },
  },
  {
    name: "quantity_delivered",
    label: "Quantity Delivered",
    field: "quantity",
    format: (val, row) => {
      if (val) {
        return val.delivered;
      }
    },
  },
  {
    name: "quantity_unit",
    label: "Quantity Unit",
    field: "quantity",
    format: (val, row) => {
      if (val) {
        return val.unit_display;
      }
    },
  },
  {
    name: "unit_price",
    label: "Unit Price",
    field: "unit_price",
    format: (v) => {
      if (v) {
        return parseFloat(v.net).toFixed(4) + " " + v.currency_display;
      }
      return null;
    },
  },
  {
    name: "extended_price",
    label: "Extended Price",
    field: "extended_price",
    format: (v) => {
      if (v) {
        return v.net + " " + v.currency_display;
      }
      return null;
    },
  },
  {
    name: "stock_quantity",
    label: "Stock Quantity",
    field: "stock_data",
    format: (val, row) => {
      if (val) {
        return val.quantity;
      }
    },
  },
  {
    name: "stock_value",
    label: "Stock Value",
    field: "stock_data",
    format: (val) => {
      if (val) {
        return val.value + " " + val.value_currency;
      }
    },
  },
  {
    name: "stock_location",
    label: "Stock Location(s)",
    field: "stock_data",
    format: (val) => {
      if (val && val.storage_location) {
        return val.storage_location.join(", ");
      }
    },
  },
];

export default {
  setup() {
    const rows = ref([]);
    const filter = ref("");
    const loading = ref(false);
    const show_shipping_checkbox_model = ref(false);
    const show_not_shipped_checkbox_model = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    function onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      const filter = props.filter;

      loading.value = true;

      api
        .get("/api/invoiceItemWithStorage/", {
          params: {
            show_shipping: show_shipping_checkbox_model.value,
            show_not_shipped: show_not_shipped_checkbox_model.value,
            searchText: filter,
            pageSize: rowsPerPage,
            pageNumber: page,
          },
        })
        .then((response) => {
          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.rowsNumber = response.data.count;
          rows.value = response.data.results;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function reload_invoice_items() {
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    onMounted(() => {
      // get initial data from server (1st page)
      onRequest({
        pagination: pagination.value,
        filter: undefined,
      });
    });

    return {
      filter,
      loading,
      show_shipping_checkbox_model,
      show_not_shipped_checkbox_model,
      pagination,
      columns,
      rows,

      reload_invoice_items,
      onRequest,
    };
  },
  created() {
    this.$watch(
      () => this.show_shipping_checkbox_model,
      (toParams, previousParams) => {
        this.reload_invoice_items();
      }
    );
    this.$watch(
      () => this.show_not_shipped_checkbox_model,
      (toParams, previousParams) => {
        this.reload_invoice_items();
      }
    );
  },
};
</script>
