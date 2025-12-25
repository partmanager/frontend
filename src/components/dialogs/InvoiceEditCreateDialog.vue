<template>
  <q-dialog @before-show="load_invoice_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          ref="numberRef"
          v-model="invoice.number"
          class="col"
          filled
          label="Number"
          hint="Invoice number"
          :rules="[(val) => !!val || 'Invoice number is required']"
          dense
        />

        <br />

        <div class="row q-gutter-md">
          <DateInputWidtet
            ref="invoiceDateRef"
            v-model="invoice.date"
            class="col"
            label="Invoice Date YYYY-MM-DD"
            hint="Invoice Date YYYY-MM-DD"
            filled
            dense
            :rules="[(val) => !!val || 'Field is required']"
          ></DateInputWidtet>

          <DateInputWidtet
            ref="dueDateRef"
            v-model="invoice.due_date"
            class="col"
            label="Due date YYYY-MM-DD"
            hint="Invoice Due Date YYYY-MM-DD"
            filled
            dense
            :rules="[(val) => !!val || 'Field is required']"
          ></DateInputWidtet>
        </div>

        <br />

        <div class="row q-gutter-md">
          <q-input
            ref="amountNetRef"
            v-model="amount.net"
            class="col"
            label="Total amount net"
            hint="Total amount net"
            mask="#.##"
            fill-mask="0"
            reverse-fill-mask
            filled
            dense
          />
          <q-input
            ref="amountGrossRef"
            v-model="amount.gross"
            class="col"
            filled
            label="Total amount gross"
            hint="Total amount gross"
            mask="#.##"
            fill-mask="0"
            reverse-fill-mask
            dense
          />
          <CurrencySelectWidget
            ref="amountCurrencyRef"
            v-model="amount.currency"
            class="col"
            :rules="[(val) => !!val || 'Field is required']"
          ></CurrencySelectWidget>
        </div>
        <br />
        <div class="row">
          <q-input
            v-if="
              amount.currency && amount.currency.value != localCurrency.value
            "
            v-model="exchange_rate"
            :prefix="`1 ${amount.currency.label} =`"
            :suffix="localCurrency.label"
            filled
            label="Exchange Rate"
            hint="Exchange rate"
            dense
            :rules="[(val) => !!val || 'Field is required']"
          />
        </div>

        <br />
        <div class="row">
          <q-checkbox v-model="paid" label="Paid" />
          <q-checkbox v-model="isIncome" label="Income" />
        </div>
        <TagsWidget
          v-model="invoice.tags"
          label="Tags"
          filled
          dense
        ></TagsWidget>
        <br />

        <DistributorSelect
          ref="distributorRef"
          v-model="distributor"
          :rules="[(val) => !!val || 'Field is required']"
        ></DistributorSelect>
        <br />

        <q-file
          v-model="file"
          label="Invoice file"
          hint="Invoice file"
          clearable
          filled
          dense
        />

        <q-input
          v-model="invoice.note"
          type="textarea"
          filled
          autogrow
          label="Note"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="validate_and_submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { api_invoice_create, api_invoice_update } from "boot/invoices_api.js";
import { get_currency_by_id } from "src/boot/choices.js";
import DateInputWidtet from "src/components/widgets/DateInputWidget.vue";
import DistributorSelect from "src/components/widgets/DistributorSelect.vue";
import CurrencySelectWidget from "src/components/CurrencySelectWidget.vue";
import TagsWidget from "src/components/widgets/TagsWidget.vue";

export default defineComponent({
  name: "InvoiceEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    id_to_edit: { type: Number },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const numberRef = ref(null);
    const invoiceDateRef = ref(null);
    const dueDateRef = ref(null);
    const amountNetRef = ref(null);
    const amountGrossRef = ref(null);
    const amountCurrencyRef = ref(null);
    const distributorRef = ref(null);

    const localCurrency = get_currency_by_id(3);
    const paid = ref(false);
    const isIncome = ref(false);
    const file = ref();
    const distributor = ref();
    const invoice = ref({
      number: null,
      date: null,
      due_date: null,
      tags: [],
      note: null,
    });
    const exchange_rate = ref(null);
    const amount = ref({ net: null, gross: null, currency: null });
    const invoiceFileUrl = ref(null);
    const previousInvoiceFile = ref(null);

    function validate() {
      let validated = true;
      validated &= numberRef.value.validate();
      validated &= invoiceDateRef.value.validate();
      validated &= dueDateRef.value.validate();
      validated &= amountNetRef.value.validate();
      validated &= amountGrossRef.value.validate();
      validated &= amountCurrencyRef.value.validate();
      validated &= distributorRef.value.validate();
      return validated;
    }

    function fields_to_api_form_data() {
      if (amount.value.currency.value == localCurrency.value) {
        exchange_rate.value = 1;
      }

      let formData = new FormData();

      formData.append("number", invoice.value.number);
      formData.append("invoice_date", invoice.value.date);
      formData.append("due_date", invoice.value.due_date);
      formData.append("paid", paid.value);
      formData.append("is_income", isIncome.value);
      formData.append("distributor", distributor.value.id);
      formData.append("price_net", amount.value.net);
      formData.append("price_gross", amount.value.gross);
      formData.append("price_currency", amount.value.currency.value);
      formData.append("price_exchange_rate", exchange_rate.value);
      for (var i = 0; i < invoice.value.tags.length; i++) {
        formData.append("tags", invoice.value.tags[i].id);
      }

      formData.append("note", invoice.value.note);
      if (file.value != previousInvoiceFile.value)
        formData.append("invoice_file", file.value);

      return formData;
    }

    function validate_and_submit() {
      if (validate()) {
        if (props.id_to_edit) {
          const formData = fields_to_api_form_data();
          api_invoice_update(props.id_to_edit, formData).finally(() => {
            if (props.onsave) {
              props.onsave(invoice);
            }
          });
        } else {
          const formData = fields_to_api_form_data();
          api_invoice_create(formData).finally(() => {
            if (props.onsave) {
              props.onsave(invoice);
            }
          });
        }
      }
    }

    function load_invoice_data() {
      if (props.id_to_edit) {
        api
          .get(`/api/invoice/invoice/${props.id_to_edit}/`)
          .then((response) => {
            invoice.value.number = response.data.number;
            invoice.value.tags = response.data.tags;
            invoice.value.date = response.data.invoice_date;
            invoice.value.due_date = response.data.due_date;

            paid.value = response.data.paid;
            isIncome.value = response.data.is_income;
            invoice.value.note = response.data.note;

            distributor.value = response.data.distributor;

            amount.value.net = parseFloat(response.data.price.net).toFixed(2);
            amount.value.gross = parseFloat(response.data.price.gross).toFixed(
              2
            );
            amount.value.currency = get_currency_by_id(
              response.data.price.currency
            );

            exchange_rate.value = response.data.price_exchange_rate;

            if (response.data.invoice_file) {
              invoiceFileUrl.value = new URL(response.data.invoice_file);
              previousInvoiceFile.value = new File(
                [],
                invoiceFileUrl.value.pathname.split("/").pop()
              );

              file.value = previousInvoiceFile.value;
            } else {
              previousInvoiceFile.value = null;
              invoiceFileUrl.value = null;
              file.value = null;
            }
          });
      }
    }

    return {
      numberRef,
      invoiceDateRef,
      dueDateRef,
      amountNetRef,
      amountGrossRef,
      amountCurrencyRef,
      distributorRef,

      localCurrency,

      paid,
      isIncome,
      file,
      distributor,
      invoice,
      exchange_rate,
      amount,

      load_invoice_data,
      validate_and_submit,
    };
  },
  components: {
    DistributorSelect,
    CurrencySelectWidget,
    DateInputWidtet,
    TagsWidget,
  },
});
</script>
