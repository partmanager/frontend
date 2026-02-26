<template>
  <q-table
    ref="tableRef"
    title="Invoices Items"
    row-key="id"
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :filter="filter"
    v-model:pagination="pagination"
    @request="onRequest"
    :visible-columns="props.visibleColumns"
  >
    <template v-slot:top>
      <strong>Invoice Items</strong>
      <slot name="header"></slot>
      <q-space />
      <q-select
        v-model:model-value="localVisibleColumns"
        multiple
        outlined
        dense
        options-dense
        :display-value="$q.lang.table.columns"
        emit-value
        map-options
        :options="columns"
        option-value="name"
        options-cover
        style="min-width: 150px"
        @update:model-value="
          (newValue) => $emit('update:visibleColumns', newValue)
        "
      />

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
          <q-icon v-if="props.row.type == 3" name="local_shipping"></q-icon>
          <q-icon v-if="props.row.type == 2" name="design_services"></q-icon>
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div class="q-gutter-sm">
          <q-btn
            padding="xs"
            color="primary"
            icon="edit"
            title="Edit"
            @click="$emit('onEditClick', props.row)"
          />
          <q-btn
            padding="xs"
            color="red"
            icon="delete"
            title="Delete invoice item"
            @click="$emit('onDeleteClick', props.row)"
          />
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
</template>

<script>
import { ref, onMounted, defineComponent, watch } from "vue";
import { api } from "boot/axios";
import { format_currency, format_bookkeeping } from "boot/formaters.js";

const columns = [
  {
    name: "distributor",
    label: "Distributor",
    align: "left",
    field: "invoice",
    format: (val) => val.distributor.name,
  },
  {
    name: "invoice",
    label: "Invoice",
    align: "left",
    field: "invoice",
    format: (val) => val.number + " (" + val.invoice_date + ")",
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
  { name: "action", label: "Action", align: "left", required: true },
  {
    name: "bookkeeping",
    label: "Bookkeeping",
    align: "left",
    field: "bookkeeping",
    format: format_bookkeeping,
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
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
    name: "extended_price",
    label: "Extended Price (net)",
    field: "extended_price",
    format: (v) => {
      if (v) {
        return format_currency(v.net, v.currency);
      }
      return null;
    },
  },
  {
    name: "tax_rate",
    label: "TAX Rate",
    field: "extended_price",
    format: (v) => v.vat_tax + "%",
  },
  {
    name: "serial_number",
    label: "Serial Number",
    field: "serial_number",
  },
  {
    name: "lot_number",
    label: "LOT Number",
    field: "LOT",
  },
  {
    name: "COO",
    label: "COO",
    field: "COO",
  },
  {
    name: "ECCN",
    label: "ECCN",
    field: "ECCN",
  },
  {
    name: "TARIC",
    label: "TARIC",
    field: "TARIC",
  },
  {
    name: "local_price",
    label: "Local Extended Price (net)",
    field: "local_price",
    format: (v) => {
      if (v) {
        return format_currency(v.net, v.currency);
      }
      return null;
    },
  },
  {
    name: "unit_price",
    label: "Unit Price (net)",
    field: "unit_price",
    format: (v) => {
      if (v) {
        return format_currency(v.net, v.currency, 4);
      }
      return null;
    },
  },
  {
    name: "stock_quantity",
    label: "Stock Quantity",
    field: "stock_data",
    format: (val) => val.quantity,
  },
  {
    name: "stock_value",
    label: "Stock Value",
    field: "stock_data",
    format: (val) => {
      if (val.value_currency) {
        return val.value + " " + val.value_currency;
      }
    },
  },
  {
    name: "stock_location",
    label: "Stock Location(s)",
    field: "stock_data",
    format: (val) => {
      if (val.storage_location) {
        return val.storage_location.join(",");
      }
    },
  },
];

export default defineComponent({
  name: "InvoiceItemsTable",
  props: {
    visibleColumns: {
      type: Array,
    },
    requiredColumns: {
      type: Array,
    },
    filters: {
      type: Object,
    },
  },
  emits: ["update:visibleColumns", "onEditClick", "onDeleteClick"],
  setup(props) {
    const tableRef = ref();

    const rows = ref([]);
    const localVisibleColumns = ref(props.visibleColumns);
    const filter = ref("");
    const loading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    function onRequest(params) {
      loading.value = true;

      var t = {
        searchText: params.filter,
        pageSize: params.pagination.rowsPerPage,
        pageNumber: params.pagination.page,
        ...props.filters,
      };

      api
        .get("/api/invoice/itemWithStorage/", {
          params: t,
        })
        .then((response) => {
          pagination.value.page = params.pagination.page;
          pagination.value.rowsPerPage = params.pagination.rowsPerPage;
          pagination.value.rowsNumber = response.data.count;
          rows.value = response.data.results;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function reload_invoice_items() {
      tableRef.value.requestServerInteraction();
    }

    watch(
      () => props.filters,
      (current, previous) => {
        tableRef.value.requestServerInteraction();
      }
    );

    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction();
    });

    return {
      props,
      tableRef,

      columns,
      rows,
      filter,
      localVisibleColumns,
      loading,
      pagination,

      reload_invoice_items,
      onRequest,
    };
  },
  methods: {
    reload() {
      return this.$refs.tableRef.requestServerInteraction();
    },
  },
});
</script>
