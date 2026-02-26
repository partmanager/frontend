<template>
  <div class="q-pa-md q-gutter-md">
    <div class="row">
      <q-card class="col" align="justify">
        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col">
              <q-item-label
                >Distributor:
                <strong>{{ invoice.distributor.name }}</strong></q-item-label
              >
              <q-item-label
                >Invoice Number:
                <strong>{{ invoice.number }}</strong></q-item-label
              >
              <q-item-label
                >Invoice date: <strong>{{ invoice.date }}</strong></q-item-label
              >
              <q-item-label
                >Due date: <strong>{{ invoice.due_date }}</strong></q-item-label
              >
              <q-item-label
                >Income:
                <strong>{{
                  invoice.isIncome ? "Yes" : "No"
                }}</strong></q-item-label
              >
              <p>
                <a :href="invoice.invoice_file">Invoice file</a>
              </p>
            </div>
            <div class="col">
              <q-item-label
                >Total price net:
                {{ format_currency(invoice.price.net, invoice.price.currency) }}
              </q-item-label>
              <q-item-label
                >Total price gross:
                {{
                  format_currency(invoice.price.gross, invoice.price.currency)
                }}
              </q-item-label>
              <q-item-label
                >Total local price net:
                {{
                  format_currency(
                    invoice.local_price.net,
                    invoice.local_price.currency
                  )
                }}
              </q-item-label>
              <q-item-label
                >Total local price gross:
                {{
                  format_currency(
                    invoice.local_price.gross,
                    invoice.local_price.currency
                  )
                }}
              </q-item-label>
              <q-item-label
                v-if="
                  invoice.price &&
                  invoice.local_price &&
                  invoice.price.currency != invoice.local_price.currency
                "
                >Exchange rate:
                {{ format_currency(1, invoice.price.currency) }} =
                {{
                  format_currency(
                    invoice.price_exchange_rate,
                    invoice.local_price.currency,
                    4
                  )
                }}
              </q-item-label>
              <q-item-label
                >Paid:
                <strong>{{ invoice.paid ? "Yes" : "No" }}</strong></q-item-label
              >
            </div>

            <div class="col">
              <q-item-label>Tags:</q-item-label>
              <q-input
                v-model="invoice.tags"
                type="textarea"
                filled
                autogrow
                readonly
              />
            </div>
          </div>
          <div>
            <q-item-label>Note:</q-item-label>
            <q-input
              v-model="invoice.note"
              type="textarea"
              filled
              autogrow
              readonly
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Edit"
            @click="invoice_edit_dialog = true"
          />
          <q-btn
            color="negative"
            label="Delete"
            @click="invoice_delete_dialog = true"
          />
        </q-card-actions>
      </q-card>

      <div class="col">
        <q-card>
          <q-tabs v-model="tabs" dense>
            <q-tab name="confirmations" label="Payment Confirmaton" />
            <q-tab name="attachments" label="Attachments" />
            <q-tab name="issues" label="Issues" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tabs" animated>
            <q-tab-panel name="confirmations">
              <PaymentConfirmationTable
                v-if="invoice.id"
                :invoice_id="invoice.id"
                dense
              ></PaymentConfirmationTable>
            </q-tab-panel>
            <q-tab-panel name="attachments">
              <FilesTable
                v-if="invoice.id"
                :invoice_id="invoice.id"
                dense
              ></FilesTable>
            </q-tab-panel>
            <q-tab-panel name="issues">
              <div>
                <q-item-label>Status:</q-item-label>
                <q-input
                  v-model="invoice.status_message"
                  type="textarea"
                  filled
                  autogrow
                  readonly
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <InvoiceItemsTable
      ref="tableRef"
      :filters="tablefilter"
      v-model:visibleColumns="
        users_store.$state.settings.invoices.invoiceDetailPage.visibleColumns
      "
      @onEditClick="edit_invoice_item"
      @onDeleteClick="delete_invoice_item"
      wrap-cells
    >
      <template v-slot:header>
        <div class="q-pl-md">
          <q-btn
            padding="sm"
            color="primary"
            label="Create Item"
            @click="invoice_item_create_dialog = true"
          />
        </div>
      </template>
    </InvoiceItemsTable>

    <InvoiceEditCreateDialog
      v-model="invoice_edit_dialog"
      title="Edit Invoice"
      :id_to_edit="invoice.id"
      :onsave="on_invoice_edit"
    >
    </InvoiceEditCreateDialog>

    <delete-confirmation-dialog
      v-model="invoice_delete_dialog"
      title="Delete Invoice"
      :ondelete="on_invoice_delete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ invoice.distributor.name }} {{ invoice.number }}</strong>
        invoice?
      </template>
    </delete-confirmation-dialog>

    <InvoiceItemEditCreateDialog
      v-model="invoice_item_create_dialog"
      :invoice="invoice"
      :onsave="on_invoice_item_created"
      title="Create Invoice Item"
    ></InvoiceItemEditCreateDialog>

    <InvoiceItemEditCreateDialog
      v-if="active_invoice_item"
      v-model="invoice_item_edit_dialog"
      :invoice="invoice"
      :invoice_item_initial_data="active_invoice_item"
      :invoice_item_id="active_invoice_item"
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
        <strong>{{ active_invoice_item.distributor_order_number.don }}</strong>
        at position
        <strong>{{ active_invoice_item.position_in_invoice }} </strong> from
        <strong>{{ invoice.distributor.name }} {{ invoice.number }}</strong>
        invoice?
      </template>
    </delete-confirmation-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useUsersStore } from "stores/users";
import { format_currency, format_paymentMethod } from "boot/formaters.js";
import {
  api_invoice_delete,
  api_invoice_item_delete,
} from "boot/invoices_api.js";
import PaymentConfirmationTable from "src/components/widgets/PaymentConfirmationTable.vue";
import InvoiceEditCreateDialog from "src/components/dialogs/InvoiceEditCreateDialog.vue";
import InvoiceItemEditCreateDialog from "src/components/dialogs/InvoiceItemEditCreateDialog.vue";
import InvoiceItemsTable from "components/widgets/InvoiceItemsTable.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";
import FilesTable from "src/components/widgets/FilesTable.vue";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const users_store = useUsersStore();

    const tableRef = ref();

    const tabs = ref("confirmations");

    // invoice manipulation dialogs
    const invoice_edit_dialog = ref(false);
    const invoice_delete_dialog = ref(false);

    // invoice item manipulation dialogs
    const delete_confirmation_dialog = ref(false);
    const invoice_item_edit_dialog = ref(false);
    const invoice_item_create_dialog = ref(false);

    const visibleColumns = ref();
    const loading = ref(false);
    const invoice = ref({
      id: null,
      distributor: { name: null },
      number: null,
      date: null,
      due_date: null,
      price: { net: null, currency_display: null },
      local_price: { net: null, gross: null, currency_display: null },
      price_exchange_rate: null,
      paid: null,
      tags: null,
      note: null,
      invoice_file: null,
      status_message: null,
    });

    const tablefilter = ref({ invoice: id });

    const active_invoice_item = ref();

    function on_invoice_edit() {
      invoice_edit_dialog.value = false;
      load_invoice_data();
    }

    function on_invoice_delete() {
      invoice_delete_dialog.value = false;
      api_invoice_delete(id, router);
    }

    function edit_invoice_item(row) {
      active_invoice_item.value = row;
      invoice_item_edit_dialog.value = true;
    }

    function create_invoice_item() {
      invoice_item_create_dialog.value = true;
    }

    function on_invoice_item_created() {
      invoice_item_create_dialog.value = false;
      load_invoice_items();
      load_invoice_data();
    }

    function update_invoice_item(data) {
      invoice_item_edit_dialog.value = false;
      load_invoice_items();
      load_invoice_data();
    }

    function delete_invoice_item(data) {
      active_invoice_item.value = data;
      delete_confirmation_dialog.value = true;
      load_invoice_items();
      load_invoice_data();
    }

    function api_call_delete_invoice_item() {
      api_invoice_item_delete(active_invoice_item.value.id).finally(() => {
        load_invoice_items();
      });
      delete_confirmation_dialog.value = false;
    }

    function load_invoice_items() {
      tableRef.value.reload();
    }

    function load_invoice_data() {
      loading.value = true;
      api
        .get(`/api/invoice/invoice/${id}`)
        .then((response) => {
          invoice.value.id = response.data.id;
          invoice.value.number = response.data.number;
          invoice.value.isIncome = response.data.is_income;
          invoice.value.date = response.data.invoice_date;
          invoice.value.due_date = response.data.due_date;
          invoice.value.distributor = response.data.distributor;
          invoice.value.invoice_file = response.data.invoice_file;
          invoice.value.currency = response.data.currency;
          invoice.value.price = response.data.price;
          invoice.value.local_price = response.data.local_price;
          invoice.value.price_exchange_rate = response.data.price_exchange_rate;
          invoice.value.paid = response.data.paid;
          invoice.value.paidDate = response.data.paid_date;
          invoice.value.tags = response.data.tags
            .map((v) => {
              return v.name;
            })
            .join(", ");
          invoice.value.note = response.data.note;
          invoice.value.status_message = response.data.status_message;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    onMounted(() => {
      load_invoice_data();
      load_invoice_items();
    });

    return {
      tabs,
      users_store,
      tableRef,
      tablefilter,

      visibleColumns,
      loading,
      invoice,

      invoice_edit_dialog,
      invoice_delete_dialog,
      on_invoice_delete,

      invoice_item_edit_dialog,
      invoice_item_create_dialog,
      delete_confirmation_dialog,

      active_invoice_item,

      format_currency,
      format_paymentMethod,

      on_invoice_edit,

      edit_invoice_item,
      create_invoice_item,
      delete_invoice_item,

      api_call_delete_invoice_item,

      update_invoice_item,
      on_invoice_item_created,
    };
  },
  components: {
    PaymentConfirmationTable,
    InvoiceEditCreateDialog,
    InvoiceItemEditCreateDialog,
    DeleteConfirmationDialog,
    FilesTable,
    InvoiceItemsTable,
  },
};
</script>
