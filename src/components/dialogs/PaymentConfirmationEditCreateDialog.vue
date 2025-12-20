<template>
  <q-dialog @before-show="load_initial_data">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-sm">
        <div class="row q-gutter-sm">
          <q-input
            v-model="paymentAmount"
            label="Payment Amount"
            type="number"
            dense
            filled
          />

          <currency-select-widget v-model="currency"></currency-select-widget>
        </div>

        <DateInputWidget
          v-model="date"
          label="Payment Date"
          filled
          hint="Payment Date"
          dense
        ></DateInputWidget>

        <q-select
          v-model="paymentMethod"
          :options="paymentTypeOptions"
          label="Payment Type"
          filled
          dense
        />

        <q-input v-model="note" type="textarea" filled autogrow label="Note" />

        <q-file
          v-model="paymentFile"
          label="Payment Confirmation File"
          accept=".pdf, .jpg, image/*"
          clearable
          filled
          dense
        />
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="on_save()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import {
  api_invoice_paymentConfirmation_create,
  api_invoice_paymentConfirmation_update,
} from "boot/invoices_api.js";
import {
  get_currency_by_id,
  paymentTypeOptions,
  get_paymentMethod_by_id,
} from "boot/choices.js";
import CurrencySelectWidget from "src/components/CurrencySelectWidget.vue";
import DateInputWidget from "src/components/widgets/DateInputWidget.vue";

export default {
  name: "PaymentConfirmationEditCreateDialog",
  components: { CurrencySelectWidget, DateInputWidget },
  props: {
    title: {
      type: String,
      default: "Payment Confirmation",
    },
    invoice_id: {
      type: Number,
    },
    paymentConfirmation_id: {
      type: Number,
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const date = ref();
    const currency = ref();
    const paymentAmount = ref();
    const paymentFile = ref();
    const paymentMethod = ref();
    const note = ref();
    const loading = ref(false);

    function on_save() {
      if (props.paymentConfirmation_id) {
        validate_and_update(props.paymentConfirmation_id);
      } else {
        validate_and_create();
      }
    }

    function validate_and_create() {
      const formData = fields_to_form_data();
      api_invoice_paymentConfirmation_create(formData).finally(() => {
        ctx.emit("onCreated");
      });
    }

    function validate_and_update(id) {
      const formData = fields_to_form_data();
      api_invoice_paymentConfirmation_update(id, formData).finally(() => {
        ctx.emit("onUpdated");
      });
    }

    function fields_to_form_data() {
      let formData = new FormData();
      formData.append("invoice", props.invoice_id);
      if (paymentFile.value) {
        formData.append("confirmation_file", paymentFile.value);
      }
      formData.append("payment_date", date.value);
      formData.append("value_net", paymentAmount.value);
      formData.append("value_currency", currency.value.value);
      formData.append("payment_method", paymentMethod.value.value);
      formData.append("note", note.value);
      return formData;
    }

    function load_initial_data() {
      load_paymentConfirmation();
    }

    function load_paymentConfirmation() {
      if (props.paymentConfirmation_id) {
        loading.value = true;
        api
          .get(
            `/api/invoice/paymentConfirmation/${props.paymentConfirmation_id}/`
          )
          .then((response) => {
            date.value = response.data.date;
            currency.value = get_currency_by_id(response.data.value_currency);
            paymentAmount.value = response.data.value_net;
            paymentFile.value = new File([], response.data.confirmation_file);
            paymentMethod.value = get_paymentMethod_by_id(
              response.data.payment_method
            );
            note.value = response.data.note;
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    return {
      currency,
      date,
      paymentAmount,
      paymentMethod,
      note,
      paymentFile,
      paymentTypeOptions,

      load_initial_data,

      on_save,
    };
  },
};
</script>
