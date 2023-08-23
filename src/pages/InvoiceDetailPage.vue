<template>
  <div class="q-pa-md">
    <q-card align="justify">
      <q-card-section>
        <p>Distributor: {{ invoice.distributor }}</p>
        <p>Invoice number: {{ invoice.number }}</p>
        <p>Invoice date: {{ invoice.date }}</p>
      </q-card-section>
    </q-card>
    <br />
    <q-table
      title="Invoice Items"
      row-key="id"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :filter="filter"
    >
      <template v-slot:top>
        <div class="q-table__title">Invoice Items</div>
        <q-btn
          color="primary"
          label="Add"
          title="Create invoice item"
          @click="create_invoice_item()"
        />
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
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div>
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="edit_invoice_item(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete invoice item"
              @click="delete_invoice_item(props.row)"
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

    <InvoiceItemEditCreateDialog
      v-model="invoice_item_create_dialog"
      :invoice="invoice"
      :onsave="update_invoice_item"
      title="Create Invoice Item"
    ></InvoiceItemEditCreateDialog>

    <InvoiceItemEditCreateDialog
      v-model="invoice_item_edit_dialog"
      :invoice="invoice"
      :invoice_item_initial_data="active_invoice_item"
      :onsave="update_invoice_item"
      title="Edit Invoice Item"
    ></InvoiceItemEditCreateDialog>

    <delete-confirmation-dialog
      v-model="delete_confirmation_dialog"
      title="Delete Invoice Item"
      :ondelete="api_call_delete_invoice_item"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_invoice_item.don }}</strong> at position
        <strong>{{ active_invoice_item.position }} </strong> from
        <strong>{{ invoice.distributor }} {{ invoice.number }}</strong>
        invoice?
      </template>
    </delete-confirmation-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import { quantity_unit_id_to_name } from "src/boot/choices.js";
import InvoiceItemEditCreateDialog from "src/components/InvoiceItemEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const columns = [
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
  { name: "action", label: "Action", align: "left" },
  {
    name: "distributor_order_number",
    label: "Distributor Order Number",
    align: "left",
    field: "don_don",
  },
  {
    name: "manufacturer_order_number",
    label: "Manufacturer Order Number",
    align: "left",
    field: "mon",
  },
  {
    name: "manufacturer",
    align: "center",
    label: "Manufacturer",
    field: "manufacturer",
  },
  {
    name: "quantity_ordered",
    label: "Quantity Ordered",
    field: "ordered_quantity",
  },
  {
    name: "quantity_shipped",
    label: "Quantity Shipped",
    field: "shipped_quantity",
  },
  {
    name: "quantity_delivered",
    label: "Quantity Delivered",
    field: "delivered_quantity",
  },
  {
    name: "quantity_unit",
    label: "Quantity Unit",
    field: "quantity_unit",
    format: quantity_unit_id_to_name,
  },
  {
    name: "unit_price",
    label: "Unit Price",
    field: "unit_price",
    format: (v) => {
      if (v) {
        return parseFloat(v.price).toFixed(4) + " " + v.currency;
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
        return v.price + " " + v.currency;
      }
      return null;
    },
  },
  { name: "stock_quantity", label: "Stock Quantity", field: "stock_quantity" },
  { name: "stock_value", label: "Stock Value", field: "stock_value" },
  {
    name: "stock_location",
    label: "Stock Location(s)",
    field: "storage_location",
  },
];

export default {
  setup() {
    const route = useRoute();
    const id = route.params.id;

    const delete_confirmation_dialog = ref(false);
    const invoice_item_edit_dialog = ref(false);
    const invoice_item_create_dialog = ref(false);

    const rows = ref([]);
    const filter = ref("");
    const loading = ref(false);
    const invoice = ref({
      id: null,
      distributor: null,
      number: null,
      date: null,
    });

    const active_invoice_item = ref();

    function edit_invoice_item(id) {
      active_invoice_item.value = id;
      invoice_item_edit_dialog.value = true;
    }

    function create_invoice_item() {
      invoice_item_create_dialog.value = true;
    }

    function update_invoice_item(data) {
      invoice_item_edit_dialog.value = false;
    }

    function delete_invoice_item(data) {
      active_invoice_item.value = data;
      delete_confirmation_dialog.value = true;
    }

    function api_call_delete_invoice_item() {
      api
        .delete(`/api/invoiceItem/${active_invoice_item.value.id}/`)
        .then((response) => {});
      delete_confirmation_dialog.value = false;
    }

    onMounted(() => {
      loading.value = true;
      api
        .get(`/invoices/api/invoice_detail/${id}`)
        .then((response) => {
          invoice.value.id = response.data.invoice.pk;
          invoice.value.distributor = response.data.invoice.distributor;
          invoice.value.number = response.data.invoice.invoiceNumber;
          invoice.value.date = response.data.invoice.date;

          rows.value = response.data.items;
        })
        .finally(() => {
          loading.value = false;
        });
    });

    return {
      columns,
      rows,
      loading,
      filter,
      invoice,

      invoice_item_edit_dialog,
      invoice_item_create_dialog,
      delete_confirmation_dialog,

      active_invoice_item,

      edit_invoice_item,
      create_invoice_item,
      delete_invoice_item,

      api_call_delete_invoice_item,

      update_invoice_item,
    };
  },
  components: { InvoiceItemEditCreateDialog, DeleteConfirmationDialog },
};
</script>
