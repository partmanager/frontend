<template>
  <q-dialog @before-show="invoice_item_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />
      <q-card-section v-if="backendError" class="error-panel">
        <div class="text-negative">Error: {{ backendError }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="invoice_item.position"
          filled
          label="Position"
          hint="Item position in invoice"
          type="number"
          dense
        />

        <q-input
          v-model="invoice_item.order_number"
          filled
          label="Order Number"
          hint="Item order number"
          dense
        />

        <DistributorOrderNumberSelect
          v-model="invoice_item.don"
          :distributor_id="props.invoice.distributor.id"
        ></DistributorOrderNumberSelect>

        <div class="row">
          <q-input
            v-model="invoice_item.qty_ordered"
            filled
            label="Quantity Ordered"
            hint="Quantity Ordered"
            type="number"
            dense
          />

          <q-input
            v-model="invoice_item.qty_shipped"
            filled
            label="Quantity Shipped"
            hint="Quantity Shipped"
            type="number"
            dense
          />

          <q-input
            v-model="invoice_item.qty_delivered"
            filled
            label="Quantity Delivered"
            hint="Quantity Delivered"
            type="number"
            dense
          />

          <quantity-unit-widget v-model="invoice_item.qty_unit">
          </quantity-unit-widget>
        </div>
        <div class="row">
          <q-input
            v-model="invoice_item.price_value"
            filled
            label="Net Price"
            hint="Item net price"
            type="number"
            dense
          />

          <q-input
            v-model="invoice_item.price_vat_tax"
            filled
            label="VAT tax rate"
            hint="VAT tax rate in %"
            type="number"
            dense
          />

          <currency-select-widget
            v-model="invoice_item.price_currency"
          ></currency-select-widget>
        </div>

        <div class="row">
          <q-select
            v-model="item_type_model"
            filled
            label="Item type"
            hint="Item type"
            option-label="name"
            :options="merchandise_type"
            :selected="invoice_item.item_type"
            dense
          />

          <bookkeeping-type-widget
            v-model="invoice_item.bookkeeping_type"
          ></bookkeeping-type-widget>
        </div>

        <q-input
          v-model="invoice_item.lot_number"
          filled
          label="LOT number"
          hint="LOT number"
          dense
        />
        <q-input
          v-model="invoice_item.ECCN"
          filled
          label="ECCN"
          hint="ECCN"
          dense
        />
        <q-input
          v-model="invoice_item.TARIC"
          filled
          label="TARIC"
          hint="TARIC"
          dense
        />
        <q-input
          v-model="invoice_item.COO"
          filled
          label="COO"
          hint="Country of origin"
          dense
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
          @click="validate_and_submit()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import {
  get_quantity_unit_by_id,
  get_currency_by_id,
} from "src/boot/choices.js";
import QuantityUnitWidget from "./QuantityUnitWidget.vue";
import CurrencySelectWidget from "./CurrencySelectWidget.vue";
import DistributorOrderNumberSelect from "./widgets/DistributorOrderNumberSelect.vue";
import BookkeepingTypeWidget from "./widgets/BookkeepingTypeWidget.vue";

const merchandise_type = [
  { name: "Part", id: 1 },
  { name: "Shipping", id: 3 },
  { name: "Service", id: 2 },
];

const bookkeping_type = [
  { label: "Track this item", value: "k" },
  { label: "Track as materials", value: "m" },
  { label: "Track as service", value: "s" },
  { label: "Track as equipment", value: "e" },
  { label: "Private use, don't track", value: "p" },
];

export default defineComponent({
  components: {
    QuantityUnitWidget,
    CurrencySelectWidget,
    DistributorOrderNumberSelect,
    BookkeepingTypeWidget,
  },
  name: "InvoiceItemEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    invoice: {
      type: Object,
    },
    invoice_item_initial_data: {
      type: Object,
    },
    invoice_item_id: {
      type: String,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const item_type_model = ref();
    const invoice_item = ref({
      id: null,
      order_number: null,
      item_type: null,
      position: null,
      invoice_id: null,
      don: null,
      qty_ordered: null,
      qty_shipped: null,
      qty_delivered: null,
      qty_unit: null,
      price_value: null,
      price_vat_tax: 23,
      price_currency: null,
      bookkeeping_type: null,
      lot_number: null,
      ECCN: null,
      TARIC: null,
      COO: null,
    });
    const backendError = ref();
    const invoice_item_don_model = ref();

    function invoice_item_edit_load_data() {
      if (props.invoice_item_id) {
        api
          .get(`/api/invoiceItem/${props.invoice_item_id.id}/`)
          .then((response) => {
            invoice_item.value.position = response.data.position_in_invoice;
            invoice_item.value.order_number = response.data.order_number;
            invoice_item.value.item_type = response.data.type;
            // invoice_item.value.don = response.data.distributor_order_number;
            invoice_item.value.qty_ordered = response.data.ordered_quantity;
            invoice_item.value.qty_shipped = response.data.shipped_quantity;
            invoice_item.value.qty_delivered = response.data.shipped_delivered;
            invoice_item.value.qty_unit = get_quantity_unit_by_id(
              response.data.quantity_unit
            );
            invoice_item.value.price_value = response.data.extended_price.net;
            invoice_item.value.price_currency = get_currency_by_id(
              response.data.extended_price.currency
            );
            item_type_model.value = merchandise_type.filter(
              (value) => value.id == response.data.type
            )[0];
            invoice_item.value.bookkeeping_type = bookkeping_type.filter(
              (value) => value.value == response.data.bookkeeping
            )[0];
            invoice_item.value.lot_number = response.data.LOT;
            invoice_item.value.ECCN = response.data.ECCN;
            invoice_item.value.TARIC = response.data.TARIC;
            invoice_item.value.COO = response.data.COO;

            api
              .get(
                `api/distributor-order-number/${response.data.distributor_order_number}/`
              )
              .then((response) => {
                invoice_item.value.don = response.data;
                // filtered_don_set.value = response.data.results;
              });
          });
      }
    }

    function validate_and_submit() {
      if (props.invoice_item_initial_data) {
        validate_and_update(props.invoice_item_initial_data.id);
      } else {
        validate_and_create();
      }
    }

    function validate_fields() {
      return true;
    }

    function fields_to_api_data() {
      const data = {
        order_number: invoice_item.value.order_number,
        type: item_type_model.value.id,
        position_in_invoice: invoice_item.value.position,
        // distributor_number: invoice_item.value.don,
        ordered_quantity: invoice_item.value.qty_ordered,
        shipped_quantity: invoice_item.value.qty_shipped,
        delivered_quantity: invoice_item.value.qty_delivered,
        quantity_unit: invoice_item.value.qty_unit.value,
        price_net: invoice_item.value.price_value,
        price_vat_tax: invoice_item.value.price_vat_tax,
        price_currency: invoice_item.value.price_currency.value,
        LOT: invoice_item.value.lot_number,
        ECCN: invoice_item.value.ECCN,
        COO: invoice_item.value.COO,
        TARIC: invoice_item.value.TARIC,
        bookkeeping: invoice_item.value.bookkeeping_type.value,
        invoice: props.invoice.id,
        distributor_order_number: invoice_item.value.don.id,
      };
      return data;
    }

    function validate_and_create() {
      if (validate_fields()) {
        const data = fields_to_api_data();
        api
          .post("/api/invoiceItem/", data)
          .then((response) => {})
          .catch((error) => {
            console.log("Problem submitting New Invoice Item", error);
            if (error.response) {
              if (error.response.data.non_field_errors) {
                backendError.value = error.response.data.non_field_errors[0];
              }
            }
          })
          .finally(() => {
            props.onsave(invoice_item);
          });
      }
    }

    function validate_and_update(invoce_item_id) {
      if (validate_fields()) {
        const data = fields_to_api_data();
        api
          .put(`/api/invoiceItem/${invoce_item_id}/`, data)
          .then((response) => {})
          .catch((error) => {
            console.log("Problem Updating Invoice Item", error);
            if (error.response) {
              if (error.response.data.non_field_errors) {
                backendError.value = error.response.data;
              }
            }
          })
          .finally(() => {
            props.onsave(invoice_item);
          });
      }
    }

    return {
      props,
      item_type_model,
      invoice_item,
      merchandise_type,
      backendError,
      invoice_item_don_model,

      invoice_item_edit_load_data,
      validate_and_submit,
    };
  },
});
</script>
