<template>
  <q-table title="Part Reservation" :columns="columns" :rows="rows"></q-table>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { api } from "boot/axios";

const columns = [
  {
    name: "project",
    label: "Project",
    align: "left",
    field: "project",
  },
  {
    name: "assembly",
    label: "Assembly",
    align: "left",
    field: "assembly",
  },
  {
    name: "quantity",
    label: "Quantity",
    align: "left",
    field: "quantity",
  },
];

export default {
  name: "InventoryReservationTable",
  props: {
    inventory_item_id: {
      type: Number,
    },
  },
  setup(props) {
    const rows = ref([]);
    const loading = ref();

    function load_reservation_items() {
      if (props.inventory_item_id) {
        loading.value = true;
        api
          .get(
            `api/inventory-reservation/?inventory=${props.inventory_item_id}`
          )
          .then((response) => {
            rows.value = response.data;
            loading.value = false;
          });
      }
    }

    watch(
      () => props.inventory_item_id,
      (current, previous) => {
        load_reservation_items();
      }
    );

    onMounted(() => {
      load_reservation_items();
    });

    return { columns, rows };
  },
};
</script>
