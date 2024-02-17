<template>
  <div class="q-pa-md">
    <q-btn
      color="secondary"
      title="Open invoice origingal file or scan"
      href="#/invoices/items"
      >Show all invoice items</q-btn
    ><br />
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
          <q-btn color="primary" label="Export" />
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
            <q-badge
              v-if="props.row.bookkeeping == 'k'"
              color="purple"
              title="This invoice is tracked by bookkeping system."
            >
              <q-icon size="sm" name="design_services" color="white" />
            </q-badge>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div>
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
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div>
            <q-icon
              v-if="props.row.all_items_mapped"
              name="star"
              title="All invoice items are mapped to part or service."
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <div class="q-gutter-md">
      <q-dialog v-model="invoice_import_dialog">
        <q-card style="width: 700px; max-width: 80vw">
          <q-card-section>
            <div class="text-h6">Invoice Import</div>
          </q-card-section>

          <q-form
            :action="backendURL + '/invoices/import'"
            method="post"
            enctype="multipart/form-data"
            class="q-gutter-md"
          >
            <q-card-section>
              <q-select
                name="importer"
                filled
                v-model="invoice_importer_importer"
                :options="invoice_importer_options"
                label="Importer"
              />
            </q-card-section>
            <q-card-section>
              <q-select
                name="distributor"
                filled
                v-model="invoice_distributor"
                :options="invoice_distributor_options"
                option-label="name"
                option-value="name"
                label="Distributor"
              />
            </q-card-section>

            <q-card-section>
              <q-input
                name="invoice_date"
                filled
                v-model="date"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="date">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-card-section>

            <q-card-section>
              <q-file
                name="file"
                filled
                v-model="invoice_importer_file"
                label="Invoice file"
              />
            </q-card-section>

            <q-card-actions align="right" class="bg-white text-teal">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn flat label="Import" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

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
import {
  get_distributor_set,
  distributor_id_to_name,
} from "src/boot/distributor_set";
import InvoiceEditCreateDialog from "src/components/InvoiceEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

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
  { name: "items_count", label: "Item Count", field: "item_count" },
  { name: "status", label: "Status", field: "status" },
  {
    name: "price",
    label: "Price",
    format: (val) => {
      if (val) {
        return `${val.net} ${val.currency_display}`;
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
        return `${val.net} ${val.currency_display}`;
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
    const invoice_distributor_options = ref(get_distributor_set());

    const active_invoice = ref({ id: null });
    const delete_confirmation_dialog = ref(false);

    function onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      const filter = props.filter;
      loading.value = true;
      api
        .get("/api/invoice", {
          params: {
            search: filter,
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
      api
        .delete(`/api/invoice/${active_invoice.value.id}/`)
        .then((response) => {});
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

    function submitForm() {
      const importer = invoice_importer_importer.value;
      let formData = new FormData();
      formData.append("importer", "asdf");
      // formData.append('file', invoice_importer_file.value)
      const request = new XMLHttpRequest();
      request.open("POST", "http://127.0.0.1:8000/invoices/import");
      request.send(formData);
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
      invoice_importer_options: [
        "Archive importer",
        "TME CSV file importer",
        "Generic CSV file importer",
      ],
      invoice_distributor: ref(),
      invoice_distributor_options,
      invoice_importer_importer: ref(),
      invoice_importer_file: ref(),

      invoice_edit_dialog,
      invoice_create_dialog,
      delete_confirmation_dialog,

      onRequest,

      active_invoice,

      edit_invoice,
      delete_invoice,
      api_call_delete_invoice,
      on_invoice_edit,
      on_invoice_create,

      distributor_id_to_name,
    };
  },
  methods: {
    onSubmit2(evt) {
      console.log("@submit - submiting to invoice import", evt);
      evt.target.submit();
    },
  },
  components: { InvoiceEditCreateDialog, DeleteConfirmationDialog },
};
</script>
