<template>
  <q-popup-edit
    title="Update stock"
    v-model="stock_mod"
    buttons
    persistent
    v-slot="scope"
    @save="
      (value, initialValue) => {
        update_item_stock(id, value, initialValue, comment);
      }
    "
  >
    <q-input
      ref="stock_ref"
      type="number"
      label="Quantity"
      v-model.number="scope.value"
      :rules="[
        (val) =>
          (val !== null && val >= 0) ||
          'Quantity is required and have to be positive',
      ]"
      dense
      autofocus
      counter
    />
    <q-input
      ref="comment_ref"
      type="textarea"
      label="Comment"
      v-model="comment"
      dense
      autogrow
    />
  </q-popup-edit>
</template>

<script>
import { ref, defineComponent, computed } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "StockUpdatePopup",
  props: {
    stock: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    onsuccess: {
      type: Function,
    },
  },
  setup(props) {
    const stock_ref = ref(null);
    const comment_ref = ref(null);
    const stock_mod = computed(() => props.stock);
    const comment = ref();

    function update_item_stock(id, value, initialValue, comment) {
      stock_ref.value.validate();
      comment_ref.value.validate();

      if (!stock_ref.value.hasError && !comment_ref.value.hasError) {
        if (value !== initialValue) {
          const data = {
            id: id,
            quantity: value,
            initial_quantity: initialValue,
            comment: comment,
          };
          api.post(`/inventory/api/update_quantity`, data).then((response) => {
            if (response.data.status === "OK") {
              props.onsuccess(response.data.quantity);
            }
          });
        }
      }
    }
    return {
      stock_ref,
      comment_ref,
      stock_mod,
      comment,
      update_item_stock,
    };
  },
});
</script>
