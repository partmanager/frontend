<template>
  <q-table title="Invoice information" hide-bottom :columns="columns">
  </q-table>
</template>

<script>
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
    name: "invoice_position",
    label: "Invoice postion",
    align: "left",
    field: "position_in_invoice",
  },
  {
    name: "shipped_quantity",
    label: "Shipped quantity",
    align: "left",
    field: "shipped_quantity",
  },
  {
    name: "LOT_number",
    label: "LOT Number",
    align: "left",
    field: "LOT",
  },
  {
    name: "COO",
    label: "COO",
    align: "left",
    field: "COO",
  },
  {
    name: "ECCN",
    label: "ECCN",
    align: "left",
    field: "ECCN",
  },
  {
    name: "TARIC",
    label: "TARIC",
    align: "left",
    field: "TARIC",
  },
  {
    name: "price",
    label: "Unit Price",
    align: "left",
    field: "unit_price",
    format: (val) => val.net + " " + val.currency_display,
  },
  {
    name: "stock_value",
    label: "Stock value",
    align: "left",
    field: "stock_value",
  },
];

export default {
  name: "InvoiceInformationTable",
  setup() {
    return { columns };
  },
};
</script>
