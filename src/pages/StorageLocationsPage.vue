<template>
  <div class="q-pa-md">
    <q-btn
      color="primary"
      label="Edit"
      :disable="loading"
      @click="storage_location_edit_dialog = true"
    />
    <q-btn
      color="red"
      label="Delete"
      :disable="loading"
      @click="delete_dialog = true"
    />
    <br />
    <br />
    <strong>Name:</strong> {{ name }}<br />
    <strong>Description:</strong>{{ description }}<br />
    <q-card>
      <q-card-section>
        <div class="text-h6">Filters</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox v-model="archived" label="Show archived" />
      </q-card-section>
    </q-card>
    <br />
    <q-table
      :title="name"
      dense
      :rows="parts"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
    >
      <template v-slot:body-cell-img="props">
        <q-td :props="props">
          <div>
            <q-img
              v-if="props.value && props.value.endsWith('/None')"
              :src="props.value"
              spinner-color="white"
              :ratio="1"
              style="height: 35ph; width: 35px"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div>
            <q-btn
              padding="xs"
              color="primary"
              icon="history"
              title="Show history"
              @click="show_history(props.row.id)"
            />
            <q-btn
              padding="xs"
              color="primary"
              icon="archive"
              title="Archive"
              :disable="props.row.stock > 0"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-stock="props">
        <q-td :props="props">
          {{ props.value }}
          <StockUpdatePopup
            :stock="props.row.stock"
            :id="props.row.id"
            :onsuccess="
              (value) => {
                props.row.stock = value;
              }
            "
          >
          </StockUpdatePopup>
        </q-td>
      </template>
    </q-table>

    <DeleteConfirmationDialog
      v-model="delete_dialog"
      :title="'Delete Storage Location'"
      :ondelete="delete_location"
    >
      <template v-slot:message>
        Are you sure you want to delete <strong>{{ name }}</strong> from storage
        locations?
      </template>
    </DeleteConfirmationDialog>

    <InventoryHistory v-model="history_dialog" :id="history_id">
    </InventoryHistory>

    <StorageLocationEditCreateDialog
      v-model="storage_location_edit_dialog"
      title="Edit Storage Location"
      :storage_location_id="active_id"
      :onsave="on_storage_location_saved"
    >
    </StorageLocationEditCreateDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";
import StockUpdatePopup from "src/components/StockUpdatePopup.vue";
import InventoryHistory from "../components/InventoryHistory.vue";
import StorageLocationEditCreateDialog from "src/components/StorageLocationEditCreateDialog.vue";

const columns = [
  {
    name: "name",
    label: "Name",
    align: "left",
    field: "name",
  },
  { name: "img", label: "Img", align: "left", field: "image" },
  { name: "action", label: "Action", align: "left" },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "manufacturer",
    align: "center",
    label: "Manufacturer",
    field: "manufacturer",
    format: (val) => {
      if (val) {
        return val.name;
      }
    },
  },
  { name: "condition", label: "Condition", field: "condition_display" },
  {
    name: "invoice",
    label: "Invoice",
    field: "invoice",
    format: (val) => {
      if (val) {
        return val.invoice.distributor.name + ": " + val.invoice.number;
      }
    },
  },
  {
    name: "stock",
    label: "Stock",
    field: "stock",
    format: (value, row) => {
      return value + " " + row.stock_unit_display;
    },
  },
  {
    name: "stock_value",
    label: "Stock Value",
    field: "invoice",
    format: (value, row) => {
      if (value) {
        return (
          (row.stock * value.unit_price.net).toPrecision(4) +
          " " +
          value.unit_price.currency_display
        );
      }
    },
  },
  {
    name: "price",
    label: "Price",
    field: "invoice",
    format: (value, row) => {
      if (value) {
        return (
          Number(value.unit_price.net).toPrecision(4) +
          " " +
          value.unit_price.currency_display
        );
      }
    },
  },
];

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const name = ref("");
    const description = ref("");
    const parts = ref([]);
    const filter = ref();
    const loading = ref(false);
    const archived = ref(false);
    const delete_dialog = ref(false);
    const history_dialog = ref(false);
    const history_id = ref(NaN);
    const storage_location_edit_dialog = ref(false);
    const storage_locations_folders = ref([]);
    const active_id = ref();

    function on_storage_location_saved(storage_location) {
      storage_location_edit_dialog.value = false;
    }

    function load_storage_location_data(id) {
      loading.value = true;
      active_id.value = Number(id);
      api
        .get(`/api/storage_location_items/${id}`)
        .then((response) => {
          name.value = response.data.location;
          parts.value = response.data.inventoryposition_set;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function delete_location() {
      const id = route.params.id;
      api
        .delete(`/api/storage_location/${id}/`)
        .then((response) => {
          if (response.status == 204) {
            delete_dialog.value = false;
            router.push("/storage_location");
          }
        })
        .finally(() => {});
    }

    function show_history(id) {
      history_id.value = id;
      history_dialog.value = true;
    }

    function onRequest() {
      load_storage_location_data(route.params.id);
    }

    onMounted(() => {
      // load_folders_data();
      load_storage_location_data(route.params.id);
    });

    return {
      columns,
      parts,
      name,
      description,
      filter,
      loading,
      archived,
      delete_dialog,
      history_dialog,
      history_id,
      storage_location_edit_dialog,
      storage_locations_folders,
      active_id,

      onRequest,
      load_storage_location_data,
      delete_location,
      show_history,
      on_storage_location_saved,
    };
  },
  components: {
    InventoryHistory,
    DeleteConfirmationDialog,
    StockUpdatePopup,
    StorageLocationEditCreateDialog,
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        if (toParams.id) {
          this.load_storage_location_data(toParams.id);
        }
      }
    );
  },
};
</script>
