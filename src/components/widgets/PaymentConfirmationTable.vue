<template>
  <div>
    <q-table
      title="Payment Confirmation"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :visible-columns="visibleColumns"
      @request="onPaymentConfirmationRequest"
    >
      <template v-slot:top>
        <div class="q-gutter-sm row">
          <div class="q-table__title">Payment Confirmation</div>
          <q-btn
            color="primary"
            label="Add Payment Confirmation"
            title="Add Payment Confirmation"
            @click="payment_confirmation_create_dialog = true"
          />
        </div>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn
              padding="xs"
              color="primary"
              icon="info"
              title="Open payment confirmation file"
              :href="props.row.confirmation_file"
              :disable="!props.row.confirmation_file"
            />
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="edit_paymentConfirmation(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete payment confirmation"
              @click="delete_payment_confirmation(props.row)"
            />
          </div>
        </q-td> </template
    ></q-table>

    <PaymentConfirmationEditCreateDialog
      v-model="payment_confirmation_create_dialog"
      :invoice_id="props.invoice_id"
      @onCreated="on_paymentConfirmation_created"
    ></PaymentConfirmationEditCreateDialog>

    <PaymentConfirmationEditCreateDialog
      v-if="active_paymentConfirmation"
      v-model="payment_confirmation_dialog"
      :invoice_id="props.invoice_id"
      :paymentConfirmation_id="active_paymentConfirmation.id"
      @onUpdated="onPaymentConfirmationUpdated"
    ></PaymentConfirmationEditCreateDialog>

    <delete-confirmation-dialog
      v-model="delete_confirmation_dialog"
      title="Delete Payment Confirmation"
      :ondelete="api_call_delete_paymentConfirmation"
    >
      <template v-slot:message>
        Are you sure you want to delete payment confirmation for
        <strong
          >{{
            format_currency(
              active_paymentConfirmation.value_net,
              active_paymentConfirmation.value_currency
            )
          }}
        </strong>
        done using
        <strong>{{
          format_paymentMethod(active_paymentConfirmation.payment_method)
        }}</strong>
        on
        <strong>{{ active_paymentConfirmation.payment_date }}</strong
        >?
      </template>
    </delete-confirmation-dialog>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import { api } from "boot/axios";
import { format_currency, format_paymentMethod } from "boot/formaters.js";
import { api_invoice_paymentConfirmation_delete } from "boot/invoices_api.js";
import PaymentConfirmationEditCreateDialog from "src/components/dialogs/PaymentConfirmationEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const columns = [
  {
    name: "date",
    label: "Date",
    align: "left",
    field: "payment_date",
    sortable: true,
  },
  {
    name: "amount",
    label: "Amount",
    align: "left",
    field: "value_net",
    sortable: true,
    format: (val, row) => {
      return format_currency(val, row.value_currency);
    },
  },
  { name: "action", label: "Action", align: "left" },
  {
    name: "method",
    label: "Payment Method",
    align: "left",
    field: "payment_method",
    sortable: true,
    format: format_paymentMethod,
  },
  {
    name: "note",
    label: "Note",
    align: "left",
    field: "note",
  },
];

export default defineComponent({
  name: "PaymentConfirmationTable",
  components: { PaymentConfirmationEditCreateDialog, DeleteConfirmationDialog },
  props: { invoice_id: { type: Number } },
  setup(props) {
    const rows = ref([]);
    const loading = ref(false);
    const active_paymentConfirmation = ref();
    const payment_confirmation_create_dialog = ref(false);
    const payment_confirmation_dialog = ref(false);
    const delete_confirmation_dialog = ref(false);

    function onPaymentConfirmationRequest() {
      if (props.invoice_id) {
        loading.value = true;
        api
          .get(
            `/api/invoice/paymentConfirmation/?invoice=${props.invoice_id}&pageSize=100`
          )
          .then((response) => {
            if (response.data.count > 0) {
              rows.value = response.data.results;
            } else {
              rows.value = [];
            }
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    function on_paymentConfirmation_created() {
      payment_confirmation_create_dialog.value = false;
      onPaymentConfirmationRequest();
    }

    function edit_paymentConfirmation(row) {
      active_paymentConfirmation.value = row;
      payment_confirmation_dialog.value = true;
    }

    function onPaymentConfirmationUpdated() {
      payment_confirmation_dialog.value = false;
      onPaymentConfirmationRequest();
    }

    function delete_payment_confirmation(row) {
      active_paymentConfirmation.value = row;
      delete_confirmation_dialog.value = true;
    }

    function api_call_delete_paymentConfirmation() {
      api_invoice_paymentConfirmation_delete(
        active_paymentConfirmation.value.id
      ).finally(() => {
        delete_confirmation_dialog.value = false;
        onPaymentConfirmationRequest();
      });
    }

    onMounted(() => {
      onPaymentConfirmationRequest();
    });

    return {
      props,
      columns,
      rows,
      loading,
      active_paymentConfirmation,

      payment_confirmation_create_dialog,
      on_paymentConfirmation_created,

      payment_confirmation_dialog,
      edit_paymentConfirmation,
      onPaymentConfirmationUpdated,

      delete_confirmation_dialog,
      delete_payment_confirmation,
      api_call_delete_paymentConfirmation,

      onPaymentConfirmationRequest,
      visibleColumns: ref(["date", "amount", "action", "method", "note"]),

      format_currency,
      format_paymentMethod,
    };
  },
});
</script>
