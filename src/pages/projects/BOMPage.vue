<template>
  <div class="q-pa-md">
    <q-card align="justify">
      <q-card-section>
        <div class="text-h6">{{ bom.name }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        Multiply: {{ bom.multiply }} <br />
        Description: {{ bom.description }} <br />
        Note: {{ bom.note }}
      </q-card-section>

      <q-card-actions>
        <q-btn
          color="primary"
          label="Edit"
          title="Edit BOM"
          @click="bom_edit_dialog = true"
        />
        <q-btn
          color="secondary"
          label="Add BOM Item"
          title="Add BOM Item"
          @click="bom_item_create_dialog = true"
        />
      </q-card-actions>
    </q-card>
    <br />
    <q-table
      flat
      bordered
      dense
      :columns="columns"
      :rows="rows"
      :visible-columns="visibleColumns"
      :wrap-cells="true"
      binary-state-sort
    >
      <template v-slot:top="props">
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

    <BOMEditCreateDialog
      v-model="bom_edit_dialog"
      title="Edit BOM"
      :bom_initial_id="active_id"
      :onsave="on_bom_save"
    >
    </BOMEditCreateDialog>

    <BOMItemEditCreateDialog
      v-model="bom_item_create_dialog"
      title="Create BOM Item"
      :bom_id="active_id"
      :onsave="on_bom_item_update"
    >
    </BOMItemEditCreateDialog>

    <BOMItemEditCreateDialog
      v-model="bom_item_edit_dialog"
      title="Edit BOM Item"
      :bom_item_id="active_item.id"
      :onsave="on_bom_item_update"
    >
    </BOMItemEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="bom_item_delete_dialog"
      :title="'Delete item from BOM'"
      :ondelete="onBOMItemDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_item.manufacturer }} {{ active_item.part }}</strong>
        item from <strong>{{ bom.name }}</strong
        >?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import BOMEditCreateDialog from "src/components/BOMEditCreateDialog.vue";
import BOMItemEditCreateDialog from "components/BOMItemEditCreateDialog.vue";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";

const columns = [
  { name: "qty", label: "Quantity", field: "quantity", sortable: true },
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
  setup() {
    const route = useRoute();
    const active_id = Number(route.params.id);
    const active_item = ref({ id: null, manufacturer: null, mpn: null });

    const bom_edit_dialog = ref();

    const bom_item_create_dialog = ref();

    const bom_item_edit_dialog = ref();
    const bom_item_delete_dialog = ref();
    const bom = ref({ name: "", multiply: null, description: "", note: "" });
    const rows = ref([]);

    function load_bom_items() {
      api.get(`/api/bom/${active_id}`).then((response) => {
        bom.value.name = response.data.name;
        bom.value.multiply = response.data.multiply;
        bom.value.description = response.data.description;
        bom.value.note = response.data.note;

        rows.value = response.data.item_set;
      });
    }

    function show_bom_item_edit_dialog(row) {
      active_item.value.id = row.id;
      bom_item_edit_dialog.value = true;
    }

    function on_bom_item_update() {
      bom_item_edit_dialog.value = false;
      load_bom_items();
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

    function on_bom_save() {
      bom_edit_dialog.value = false;
      load_bom_items();
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

    return {
      bom,
      rows,
      active_item,

      bom_item_create_dialog,

      bom_edit_dialog,
      active_id,
      on_bom_save,

      show_bom_item_edit_dialog,
      on_bom_item_update,
      bom_item_edit_dialog,

      show_delete_confirmation_dialog,
      bom_item_delete_dialog,

      onBOMItemDelete,
      columns,

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
    };
  },
  components: {
    BOMEditCreateDialog,
    BOMItemEditCreateDialog,
    DeleteConfirmationDialog,
  },
};
</script>
