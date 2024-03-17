<template>
  <q-select
    v-model="invoice_widget"
    :model-value="modelValue"
    :label="label"
    options-label="label"
    :options="invoice_items_set"
    @filter="filter_invoice_item_select"
    @update:model-value="
      (v) => {
        modelValue = v;
        emit('update:modelValue', v);
      }
    "
    :disable="disable"
    use-input
    input-debounce="300"
    fill-input
    hide-selected
    filled
  />
</template>

<script>
import { ref, onMounted, defineComponent, reactive } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "InvoiceItemSelectWidget",
  emits: ["update:modelValue"],
  props: {
    initial_invoice_item_id: {
      type: Number,
    },
    distributor: {
      type: Object,
    },
    distributor_required: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const invoice_widget = ref();
    const modelValue = ref();
    const invoice_items_set = ref([]);
    const disable = ref(true);
    const label = ref("Select distributor first");

    function filter_invoice_item_select(val, update, abort) {
      update(() => {
        if (val === "") {
          load_invoice_items(null);
        } else {
          const needle = val.toLowerCase();
          load_invoice_items(needle);
        }
      });
    }

    function load_invoice_items(search) {
      if (props.distributor_required === true && !props.distributor) {
        disable.value = true;
        label.value = "Select distributor first";
        modelValue.value = null;
      } else {
        disable.value = false;
        label.value = "Invoice";
        load_initial_data(search);
      }
    }

    function load_initial_data(search) {
      if (props.initial_invoice_item_id && !search) {
        api
          .get(`/api/invoiceItem/${props.initial_invoice_item_id}`)
          .then((response) => {
            invoice_items_set.value = [response.data];
            generate_label();
            modelValue.value = invoice_items_set.value[0];
            emit("update:modelValue", invoice_items_set.value[0]);
          });
      } else {
        var params = {};
        if (props.distributor) {
          params.invoice__distributor = props.distributor.id;
          params.search = search;
        }
        api.get(`/api/invoiceItem/`, { params: params }).then((response) => {
          invoice_items_set.value = response.data.results;
          generate_label();
        });
      }
    }

    function generate_label() {
      invoice_items_set.value.forEach((v) => {
        v.label = `${v.invoice.distributor.name}: ${v.invoice.number}(${v.order_number}), ${v.invoice.invoice_date}, position ${v.position_in_invoice} -> ${v.distributor_order_number}`;
      });
    }

    onMounted(() => {
      load_invoice_items(null);
    });

    return {
      invoice_widget,
      modelValue,
      invoice_items_set,
      disable,
      label,

      filter_invoice_item_select,

      load_invoice_items,
      emit,
    };
  },
  created() {
    this.$watch(
      () => this.$props.distributor,
      (toParams, previousParams) => {
        console.log("Distributor changed");
        this.load_invoice_items(null);
      }
    );
    this.$watch(
      () => this.$props.initial_invoice_item_id,
      (toParams, previousParams) => {
        console.log("Initial invoice id changed");
        this.load_invoice_items(null);
      }
    );
  },
});
</script>
