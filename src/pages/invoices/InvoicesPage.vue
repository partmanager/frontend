<template>
  <div class="q-pa-md">
    <q-btn
      color="secondary"
      title="Open invoice origingal file or scan"
      href="#/invoices/items"
      >Show all invoice items</q-btn
    ><br />
    <br />
    <InvoicesFiltersCard @on_change="on_filters_update"></InvoicesFiltersCard>
    <br />
    <q-table
      title="Invoices"
      row-key="id"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :filter="filter"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:top>
        <div class="q-pa-md q-gutter-sm">
          <div class="q-table__title">Invoices</div>
          <q-btn
            color="primary"
            label="Add"
            title="Add invoice"
            @click="invoice_create_dialog = true"
          />
          <q-btn
            color="primary"
            label="Import"
            @click="invoice_import_dialog = true"
          />
        </div>
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
      <template v-slot:body-cell-distributor="props">
        <q-td :props="props">
          <div>
            <a :href="props.value.website_url">{{ props.value.name }}</a>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-invoice_number="props">
        <q-td :props="props">
          <div>
            <a :href="'#/invoices/' + props.row.id">{{ props.value }}</a>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn
              padding="xs"
              color="primary"
              icon="info"
              title="Open invoice origingal file or scan"
              :href="props.row.invoice_file"
              :disable="!props.row.invoice_file"
            />
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="edit_invoice(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete invoice"
              @click="delete_invoice(props.row)"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-paid="props">
        <q-td :props="props">
          <div>
            <q-btn
              v-if="props.row.paid"
              padding="xs"
              color="primary"
              icon="check"
              title="Paid"
            />
            <q-btn
              v-if="!props.row.paid"
              padding="xs"
              :color="is_overdue(props.row.due_date) ? 'red' : 'yellow'"
              icon="close"
              title="Not paid"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div class="q-gutter-xs">
            <q-btn
              v-if="props.row.bookkeeping == 'k'"
              class="col"
              padding="xs"
              color="purple"
              icon="design_services"
            ></q-btn>

            <q-btn
              class="col"
              padding="xs"
              :color="
                props.row.status && props.row.status.length == 0
                  ? 'primary'
                  : 'yellow'
              "
              :icon="
                props.row.status && props.row.status.length == 0
                  ? 'check'
                  : 'close'
              "
              :title="props.row.status_message"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-tags="props">
        <q-td :props="props">
          <div>
            <q-chip
              v-for="tag in props.row.tags"
              :key="tag.id"
              color="secondary"
              text-color="white"
              rounded
              dense
              >{{ tag.name }}</q-chip
            >
          </div>
        </q-td>
      </template>
    </q-table>

    <div class="q-gutter-md">
      <InvoiceImportDialog
        v-model="invoice_import_dialog"
      ></InvoiceImportDialog>

      <InvoiceEditCreateDialog
        v-model="invoice_edit_dialog"
        title="Edit Invoice"
        :id_to_edit="active_invoice.id"
        :onsave="on_invoice_edit"
      >
      </InvoiceEditCreateDialog>

      <InvoiceEditCreateDialog
        v-model="invoice_create_dialog"
        title="Create Invoice"
        :onsave="on_invoice_create"
      >
      </InvoiceEditCreateDialog>

      <delete-confirmation-dialog
        v-model="delete_confirmation_dialog"
        title="Delete Invoice Item"
        :ondelete="api_call_delete_invoice"
      >
        <template v-slot:message>
          Are you sure you want delete
          <strong
            >{{ distributor_id_to_name(active_invoice.distributor) }}
            {{ active_invoice.number }}</strong
          >
          invoice?
        </template>
      </delete-confirmation-dialog>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { backendURL } from "src/boot/backend";
import { distributor_id_to_name } from "src/boot/distributor_set";
import { api_invoice_delete } from "boot/invoices_api.js";
import { format_currency } from "boot/formaters.js";
import InvoiceEditCreateDialog from "src/components/dialogs/InvoiceEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";
import InvoiceImportDialog from "src/components/dialogs/InvoiceImportDialog.vue";
import InvoicesFiltersCard from "src/components/widgets/InvoicesFiltersCard.vue";

const columns = [
  {
    name: "distributor",
    label: "Distributor",
    align: "left",
    field: "distributor",
  },
  {
    name: "invoice_number",
    label: "Invoice Number",
    align: "left",
    field: "number",
  },
  { name: "action", label: "Action", align: "left" },
  { name: "date", align: "center", label: "Date", field: "invoice_date" },
  { name: "due_date", align: "center", label: "Due date", field: "due_date" },
  { name: "paid", align: "center", label: "Paid", field: "paid" },
  { name: "items_count", label: "Item Count", field: "item_count" },
  { name: "status", label: "Status", field: "status" },
  { name: "tags", label: "Tags", field: "tags" },
  {
    name: "price",
    label: "Price (net)",
    format: (val) => {
      if (val) {
        return format_currency(val.net, val.currency);
      } else {
        return "Error";
      }
    },
    field: "price",
  },
  {
    name: "price",
    label: "Price (gross)",
    format: (val) => {
      if (val) {
        return format_currency(val.gross, val.currency);
      } else {
        return "Error";
      }
    },
    field: "price",
  },
  {
    name: "local_price",
    label: "Local Price",
    format: (val) => {
      if (val) {
        return format_currency(val.net, val.currency);
      } else {
        return "Error";
      }
    },
    field: "local_price",
  },
];

export default {
  setup() {
    const rows = ref([]);
    const filter = ref("");
    const loading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    const date = ref();
    const invoice_edit_dialog = ref(false);
    const invoice_create_dialog = ref(false);

    const active_invoice = ref({ id: null });
    const delete_confirmation_dialog = ref(false);

    const distributor_filter = ref([]);

    function date_to_drf_filter(date) {
      if (date) {
        const [month, day, year] = [
          date.getMonth(),
          date.getDate(),
          date.getFullYear(),
        ];
        return `${month + 1}/${day}/${year}`;
      } else {
        return null;
      }
    }

    function onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      const search = props.filter;
      const filter = props.filter2 || { distrubutor: null, privateUse: null };
      console.log(filter);
      let params = {
        search: search,
        pageSize: rowsPerPage,
        pageNumber: page,
        paid: filter.paid,
      };

      if (filter.distributor) {
        params.distributor__in = filter.distributor.join(",");
      }

      if (filter.invoiceDate_from) {
        params.invoice_date__gte = date_to_drf_filter(filter.invoiceDate_from);
      }
      if (filter.invoiceDate_to) {
        params.invoice_date__lte = date_to_drf_filter(filter.invoiceDate_to);
      }
      if (filter.dueDate) {
        params.due_date__gte = date_to_drf_filter(filter.dueDate.from);
        params.due_date__lte = date_to_drf_filter(filter.dueDate.to);
      }
      if (filter.privateUse !== null) {
        if (filter.privateUse) {
          params.bookkeeping = "p";
        }
        if (!filter.privateUse) {
          params.bookkeeping = "k";
        }
      }

      loading.value = true;
      api
        .get("/api/invoice/invoice", {
          params,
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

    function reload_invoices_table() {
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    function edit_invoice(data) {
      active_invoice.value = data;
      invoice_edit_dialog.value = true;
    }

    function delete_invoice(data) {
      active_invoice.value = data;
      delete_confirmation_dialog.value = true;
    }

    function api_call_delete_invoice() {
      api_invoice_delete(active_invoice.value.id);
      delete_confirmation_dialog.value = false;
      reload_invoices_table();
    }

    function on_invoice_edit() {
      invoice_edit_dialog.value = false;
      reload_invoices_table();
    }

    function on_invoice_create() {
      invoice_create_dialog.value = false;
      reload_invoices_table();
    }

    function is_overdue(due_date) {
      const now = Date.now();
      return due_date < now;
    }

    function on_filters_update(filters) {
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
        filter2: filters,
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
      backendURL,
      filter,
      loading,
      pagination,
      columns,
      rows,
      date,
      invoice_import_dialog: ref(false),

      invoice_importer_file: ref(),

      invoice_edit_dialog,
      invoice_create_dialog,
      delete_confirmation_dialog,

      distributor_filter,

      onRequest,

      active_invoice,

      edit_invoice,
      delete_invoice,
      api_call_delete_invoice,
      on_invoice_edit,
      on_invoice_create,

      is_overdue,

      distributor_id_to_name,
      on_filters_update,
    };
  },
  components: {
    InvoiceEditCreateDialog,
    DeleteConfirmationDialog,
    InvoiceImportDialog,
    InvoicesFiltersCard,
  },
};
</script>
