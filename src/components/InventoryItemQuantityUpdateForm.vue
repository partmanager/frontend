<template>
  <form @submit.prevent.stop="onSubmit">
    <q-input
      v-model="updated_quantity"
      filled
      dense
      type="number"
      label="Quantity"
    />
    <q-input v-model="comment" filled dense type="text" label="Comment" />
    <q-btn
      label="Update"
      type="submit"
      color="primary"
      @click="update_item_stock"
    />
  </form>
</template>

<script>
import { ref, defineComponent, computed } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

export default {
  name: "InventoryItemQuantityUpdateForm",
  props: {
    invoice_item_id: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
    },
  },
  emits: ["onQuantityUpdated"],
  setup(props, ctx) {
    const $q = useQuasar();
    const comment = ref();
    const updated_quantity = computed(() => props.quantity);

    function update_item_stock() {
      if (updated_quantity.value !== props.quantity) {
        const data = {
          id: props.invoice_item_id,
          quantity: updated_quantity.value,
          initial_quantity: props.quantity,
          comment: comment.value,
        };
        api.post(`/inventory/api/update_quantity`, data).then((response) => {
          if (response.data.status === "OK") {
            $q.notify({
              color: "positive",
              message: `Quantity updated to ${response.data.quantity} ${response.data.unit}`,
            });
            ctx.emit("onQuantityUpdated");
          } else {
            $q.notify({
              color: "negative",
              message: "Unable to update quantity E1",
              icon: "report_problem",
            });
          }
        });
      } else {
        $q.notify({
          color: "info",
          message: `Updated quantity is the same as initial quantity. Nothing to update.`,
        });
      }
    }

    return { comment, updated_quantity, props, update_item_stock };
  },
};
</script>
