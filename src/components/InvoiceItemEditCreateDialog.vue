<template>
  <q-dialog @before-show="invoice_item_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />
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

        <q-select
          v-model="item_type_model"
          filled
          label="Item type"
          hint="Item type"
          option-label="name"
          :options="bookkeeping_options"
          :selected="invoice_item.item_type"
          dense
        />

        <q-input
          v-model="invoice_item.don"
          filled
          label="Distributor Order Number"
          hint="Distributor specific order number"
          dense
        />

        <quantity-unit-widget v-model="invoice_item.qty_unit">
        </quantity-unit-widget>

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
          v-model="invoice_item.price_value"
          filled
          label="Price"
          hint="Item unit price"
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

const bookkeeping_options = [
  { name: "Part", id: "p" },
  { name: "Shipping", id: "s" },
  { name: "Service", id: "v" },
];

export default defineComponent({
  components: { QuantityUnitWidget, CurrencySelectWidget },
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
    });

    function invoice_item_edit_load_data() {
      if (props.invoice_item_initial_data) {
        invoice_item.value.id = props.invoice_item_initial_data.id;
        invoice_item.value.invoice_id =
          props.invoice_item_initial_data.invoice_pk;
        invoice_item.value.position = props.invoice_item_initial_data.position;
        invoice_item.value.order_number =
          props.invoice_item_initial_data.order_number;
        invoice_item.value.item_type =
          props.invoice_item_initial_data.item_type;
        invoice_item.value.don = props.invoice_item_initial_data.don;
        invoice_item.value.qty_ordered =
          props.invoice_item_initial_data.quantity_ordered;
        invoice_item.value.qty_shipped =
          props.invoice_item_initial_data.quantity_shipped;
        invoice_item.value.qty_unit = get_quantity_unit_by_id(
          props.invoice_item_initial_data.quantity_unit
        );
        invoice_item.value.price_value =
          props.invoice_item_initial_data.extended_price.price;
        invoice_item.value.price_currency = get_currency_by_id(
          props.invoice_item_initial_data.extended_price.currency
        );

        item_type_model.value = bookkeeping_options.filter(
          (value) => value.id == props.invoice_item_initial_data.item_type
        )[0];
      }
    }

    function validate_and_submit() {
      if (props.invoice_item_initial_data) {
        validate_and_update(props.invoice_item_initial_data.id);
        // const data = {
        //   id: invoice_item.value.id,
        //   invoice_pk: invoice_item.value.invoice_id,
        //   position: invoice_item.value.position,
        //   // item_type: invoice_item.value.item_type.id,
        //   item_type: item_type_model.value.id,
        // };
        // api
        //   .post(`/invoices/api/invoice_items_update`, data)
        //   .then((response) => {})
        //   .finally(() => {
        //     props.onsave(invoice_item);
        //   });
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
        distributor_number: invoice_item.value.don,
        ordered_quantity: invoice_item.value.qty_ordered,
        shipped_quantity: invoice_item.value.qty_shipped,
        delivered_quantity: invoice_item.value.qty_delivered,
        quantity_unit: invoice_item.value.qty_unit.value,
        price_value: invoice_item.value.price_value,
        price_vat_tax: invoice_item.value.price_vat_tax,
        price_currency: invoice_item.value.price_currency.value,
        invoice: props.invoice.id,
        // distributor_order_number: invoice_item.value.don,
      };
      return data;
    }

    function validate_and_create() {
      if (validate_fields()) {
        const data = fields_to_api_data();
        api
          .post("/api/invoiceItem/", data)
          .then((response) => {})
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
          .finally(() => {
            props.onsave(invoice_item);
          });
      }
    }

    return {
      item_type_model,
      invoice_item,
      bookkeeping_options,

      invoice_item_edit_load_data,
      validate_and_submit,
    };
  },
});
</script>
