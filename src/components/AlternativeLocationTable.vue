<template>
  <q-table
    title="Alternative Locations"
    hide-bottom
    :columns="columns"
    :rows="rows"
  >
  </q-table>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import {
  format_condition,
  format_quantity,
  format_currency,
} from "boot/formaters.js";

const columns = [
  {
    name: "distributor",
    label: "Distributor",
    align: "left",
    field: "invoice",
    format: (val) => {
      if (val) {
        return val.invoice.distributor.name;
      }
    },
  },
  {
    name: "invoice",
    label: "Invoice",
    align: "left",
    field: "invoice",
    format: (val) => {
      if (val) {
        return val.invoice.number;
      }
    },
  },
  {
    name: "invoice_date",
    label: "Invoice Date",
    align: "left",
    field: "invoice",
    format: (val) => {
      if (val) {
        return val.invoice.invoice_date;
      }
    },
  },
  {
    name: "shipped_quantity",
    label: "Shipped quantity",
    align: "left",
    field: "invoice",
    format: (val) => {
      if (val) {
        return format_quantity(val.shipped_quantity, val.quantity_unit);
      }
    },
  },
  {
    name: "stock_quantity",
    label: "Stock quantity",
    align: "left",
    field: "stock",
    format: (val, row) => {
      return format_quantity(val, row.stock_unit);
    },
  },
  {
    name: "storage_location",
    label: "Storage location",
    align: "left",
    field: "storage_location",
    format: (val) => {
      return val.location;
    },
  },
  {
    name: "condition",
    label: "Condition",
    align: "left",
    field: "condition",
    format: format_condition,
  },
  {
    name: "price",
    label: "Unit Price",
    align: "left",
    field: "invoice",
    format: (val) => {
      if (val && val.unit_price) {
        return format_currency(val.unit_price.net, val.unit_price.currency);
      } else {
        return "";
      }
    },
  },
  {
    name: "stock_value",
    label: "Stock value",
    align: "left",
    field: "invoice",
    format: (val, row) => {
      if (val && val.unit_price) {
        return format_currency(
          val.unit_price.net * row.stock,
          val.unit_price.currency
        );
      } else {
        return "";
      }
    },
  },
];

export default {
  name: "AlternativeLocationTable",
  props: {
    part_id: {
      type: Number,
    },
    mon_id: {
      Number,
    },
  },
  setup(props) {
    const rows = ref([]);

    function load_part_locations() {
      if (props.part_id) {
        api
          .get(`/api/part_locations/?mon__part=${props.part_id}`)
          .then((response) => {
            rows.value = response.data;
          });
      } else if (props.mon_id) {
        api.get(`/api/part_locations/?mon=${props.mon_id}`).then((response) => {
          rows.value = response.data;
        });
      }
    }

    onMounted(() => {
      load_part_locations();
    });

    return { columns, rows };
  },
};
</script>
