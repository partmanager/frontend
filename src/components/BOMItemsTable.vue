<template>
  <q-table
    flat
    bordered
    dense
    :columns="columns"
    :rows="rows"
    :visible-columns="visibleColumns"
    :wrap-cells="true"
    title="test"
    binary-state-sort
  >
    <template v-slot:top="props">
      <q-btn
        color="primary"
        title="Add"
        label="Add"
        @click="bom_item_create_dialog = true"
      />
      <q-space />

      <q-select
        v-model="visibleColumns"
        multiple
        outlined
        dense
        options-dense
        :display-value="$q.lang.table.columns"
        emit-value
        map-options
        :options="columns"
        option-value="name"
        options-cover
        style="min-width: 150px"
      />

      <q-btn
        flat
        round
        dense
        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="props.toggleFullscreen"
        class="q-ml-md"
      />
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn
            padding="xs"
            color="primary"
            icon="edit"
            title="Edit"
            @click="show_bom_item_edit_dialog(props.row)"
          />
          <q-btn
            padding="xs"
            color="red"
            icon="delete"
            title="Delete"
            @click="show_delete_confirmation_dialog(props.row)"
          />
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-qty="props">
      <q-td :props="props">
        <div>
          <q-badge
            v-if="!props.row.part && !props.row.manufacturer_order_number"
            color="red"
            title="Part unassigned."
          >
            <q-icon name="warning" color="white" class="q-ml-xs" />
          </q-badge>
          {{ props.value }}
        </div>
      </q-td>
    </template>
  </q-table>

  <BOMItemEditCreateDialog
    v-model="bom_item_create_dialog"
    title="Create BOM Item"
    :bom_id="bom_id"
    @onCreated="
      bom_item_create_dialog = false;
      load_bom_items();
    "
    @onUpdated="
      bom_item_create_dialog = false;
      load_bom_items();
    "
  ></BOMItemEditCreateDialog>

  <DeleteConfirmationDialog
    v-model="bom_item_delete_dialog"
    :title="'Delete item from BOM'"
    :ondelete="onBOMItemDelete"
  >
    <template v-slot:message>
      Are you sure you want to delete
      <strong
        >{{ active_item.manufacturer }}
        {{ active_item.part.manufacturer_part_number }}</strong
      >
      item from <strong>{{ bom.name }}</strong
      >?
    </template>
  </DeleteConfirmationDialog>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { api } from "boot/axios";
import BOMItemEditCreateDialog from "components/BOMItemEditCreateDialog.vue";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";

const columns = [
  {
    name: "qty",
    label: "Quantity",
    field: "designators",
    sortable: true,
    format: (val) => {
      return val.length;
    },
  },
  { name: "action", label: "Action", align: "left", field: "id" },
  {
    name: "group",
    label: "BOM Group",
    align: "left",
    field: "get_group_display",
    sortable: true,
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    field: "part",
    sortable: true,
    format: (val, row) => {
      if (val) {
        return val.manufacturer;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.manufacturer;
      } else {
        return "Dupa";
      }
    },
  },
  {
    name: "mpn",
    label: "MPN",
    field: "part",
    sortable: true,
    format: (val, row) => {
      if (val) {
        return val.manufacturer_part_number;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.mpn;
      } else {
        return "Dupa";
      }
    },
  },
  {
    name: "mon",
    label: "MON",
    field: "manufacturer_order_number",
    sortable: true,
    format: (val, row) => {
      if (val) {
        return val.manufacturer_order_number;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.MON;
      } else {
        return "";
      }
    },
  },
  {
    name: "designator",
    label: "Designator",
    field: "designators",
    sortable: true,
    format: (val) => {
      return val.join(", ");
    },
  },
  {
    name: "description",
    label: "Description",
    field: "part",
    sortable: true,
    format: (val, row) => {
      if (val) {
        return val.description;
      } else {
        return "";
      }
    },
  },
];

export default {
  props: {
    bom_id: {
      type: Number,
    },
  },
  setup(props) {
    const bom_item_create_dialog = ref();
    const bom_item_delete_dialog = ref();
    const rows = ref([]);
    const bom = ref({ name: "", multiply: null, description: "", note: "" });
    const active_item = ref({ id: null, manufacturer: null, mpn: null });

    function load_bom_items() {
      if (props.bom_id) {
        api.get(`/api/bom/${props.bom_id}`).then((response) => {
          bom.value.name = response.data.name;
          bom.value.description = response.data.description;
          bom.value.note = response.data.note;

          rows.value = response.data.item_set;
        });
      }
    }

    function show_delete_confirmation_dialog(row) {
      active_item.value.id = row.id;
      if (row.part) {
        active_item.value.part = row.part;
      } else {
        active_item.value.part = row.part_not_found_fallback.MPN;
      }

      if (row.part) {
        active_item.value.manufacturer = row.part.manufacturer;
      } else if (row.part_not_found_fallback) {
        active_item.value.manufacturer =
          row.part_not_found_fallback.Manufacturer;
      } else {
        active_item.value.manufacturer = "Dupa";
      }

      bom_item_delete_dialog.value = true;
    }

    function onBOMItemDelete() {
      api.delete(`api/bom-item/${active_item.value.id}`).then((response) => {
        load_bom_items();
        bom_item_delete_dialog.value = false;
      });
    }

    onMounted(() => {
      load_bom_items();
    });

    // watch(
    //   () => props.bom_id,
    //   (current, previous) => {
    //     load_bom_items();
    //   }
    // );

    return {
      bom_item_create_dialog,
      bom_item_delete_dialog,

      bom,
      active_item,

      columns,
      rows,
      visibleColumns: ref([
        "qty",
        "action",
        "group",
        "manufacturer",
        "mpn",
        "mon",
        "designator",
        "description",
      ]),
      load_bom_items,
      show_delete_confirmation_dialog,
      onBOMItemDelete,
    };
  },
  components: { BOMItemEditCreateDialog, DeleteConfirmationDialog },
};
</script>
