<template>
  <q-dialog @before-show="load_initial_data" full-width>
    <q-card>
      <q-card-section>
        <div class="text-h6">Part rework</div>
      </q-card-section>
      <q-card-section>
        Designator: {{ assembly_item.designator }} <br />
        MPN: {{ assembly_item.part.manufacturer_part_number }} <br />
        Description: {{ assembly_item.part.description }}<br />
        Reserved quantity: {{ reserved_qty }}<br />
        <q-checkbox
          v-model="assembly_item.assembled"
          label="Assembled"
        ></q-checkbox>
        <q-checkbox
          v-model="assembly_item.sourced_externally"
          label="Externally sourced"
        ></q-checkbox>
        <q-checkbox
          v-model="new_partnumber"
          label="Change part number"
        ></q-checkbox>
      </q-card-section>
      <q-card-section>
        <q-input
          dense
          v-model="assembly_item.LOT"
          @keyup.enter="prompt = false"
          label="LOT"
          hint="Part LOT Number"
        />
        <q-input
          dense
          v-model="assembly_item.note"
          @keyup.enter="prompt = false"
          label="note"
          hint="Rework note"
        />
      </q-card-section>

      <q-card-section v-if="new_partnumber">
        <PartSelectTable
          v-model="part_select_table"
          title="Edit BOM Part"
          v-model:selected="selected_part"
          :manufacturer="filters.manufacturer"
          :part_number="filters.part_number"
          :onSelectChange="() => {}"
        ></PartSelectTable>
      </q-card-section>

      <q-card-section>
        <AlternativeLocationTable
          v-if="assembly_item.assembled && !assembly_item.sourced_externally"
          title="Part Locations"
          :part_id="assembly_item.part.id"
          selection="single"
          v-model:selected="part_select_table_selected"
          @selection="test_dialog = true"
        ></AlternativeLocationTable>
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="create_rework_validate_and_submit()"
        />
      </q-card-actions>

      <InventoryItemQtyReservationDialog
        v-model="test_dialog"
        :inventory_item="part_select_table_selected[0] || {}"
        :assembly="assembly_item || {}"
        :min_qty="1"
        persistent
        @onCreated="
          (x) => {
            reserved_qty = x;
            test_dialog = false;
          }
        "
        @onCancel="part_select_table_selected = []"
      ></InventoryItemQtyReservationDialog>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import AlternativeLocationTable from "components/AlternativeLocationTable.vue";
import PartSelectTable from "components/widgets/PartSelectTable.vue";
import InventoryItemQtyReservationDialog from "components/dialogs/InventoryItemQtyReservationDialog.vue";

export default defineComponent({
  name: "AssemblyItemReworkDialog",
  props: {
    assembly_item_id: {
      type: Number,
      required: true,
    },
  },
  emits: ["onCreated", "onUpdated"],
  components: {
    AlternativeLocationTable,
    PartSelectTable,
    InventoryItemQtyReservationDialog,
  },
  setup(props, ctx) {
    const name = ref();
    const description = ref();
    const assembly_item = ref({ part: {} });
    const new_partnumber = ref(false);
    const part_select_table = ref();
    const part_select_table_selected = ref([]);
    const selected_part = ref();
    const filters = ref({});

    const test_dialog = ref();
    const reserved_qty = ref();

    function validate_and_submit() {
      const assembly_item_data = {
        assembled: assembly_item.value.assembled,
        sourced_externally: assembly_item.value.sourced_externally,
        LOT: assembly_item.value.LOT,
        note: assembly_item.value.note,
        invoice_item: part_select_table_selected.value[0].invoice.id,
      };

      console.log(part_select_table_selected.value);
      if (
        part_select_table_selected.value &&
        reserved_qty.value &&
        reserved_qty.value > 0
      ) {
        console.log(selected_part);

        const data = {
          quantity: reserved_qty.value,
          inventory: part_select_table_selected.value[0].id,
          assembly: props.assembly_item_id,
        };
        api.post(`api/inventory-reservation/`, data).then((response) => {});
      }

      api
        .patch(
          `/api/assembly-item/${props.assembly_item_id}/`,
          assembly_item_data
        )
        .then((response) => {
          ctx.emit("onUpdated");
        });
    }

    function on_items_reserved() {
      test_dialog.value = false;
    }

    function create_rework_validate_and_submit() {
      validate_and_submit();
    }

    function load_initial_data() {
      api
        .get(`/api/assembly-item/${props.assembly_item_id}/`)
        .then((response) => {
          assembly_item.value = response.data;
          if (
            response.data.inventoryreservation_set &&
            response.data.inventoryreservation_set.length > 0
          ) {
            reserved_qty.value =
              response.data.inventoryreservation_set[0].quantity;
          }
          filters.value.part_number =
            assembly_item.value.part.manufacturer_part_number;
          // selected_part.value = assembly_item.value.part.id;
        });
    }

    return {
      name,
      description,
      assembly_item,
      new_partnumber,

      part_select_table,
      part_select_table_selected,
      selected_part,
      filters,

      test_dialog,
      reserved_qty,

      create_rework_validate_and_submit,
      load_initial_data,
      on_items_reserved,
    };
  },
});
</script>
