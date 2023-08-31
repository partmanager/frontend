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
      :folders="storage_locations_folders"
      :storage_location_initial_data="{ name: name, description: description }"
      :onsave="save_edited_storage_location"
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
    field: "part",
    format: (value, row) => {
      if (value) {
        return value.name;
      } else {
        return row.name;
      }
    },
  },
  { name: "img", label: "Img", align: "left", field: "image" },
  { name: "action", label: "Action", align: "left" },
  {
    name: "description",
    label: "Description",
    align: "left",
    format: (value, row) => {
      if (value) {
        return value.description;
      } else {
        return row.description;
      }
    },
    field: "part",
  },
  {
    name: "calories",
    align: "center",
    label: "Manufacturer",
    field: "manufacturer",
  },
  { name: "condition", label: "Condition", field: "condition" },
  { name: "invoice", label: "Invoice", field: "invoice_number" },
  { name: "stock", label: "Stock", field: "stock" },
  {
    name: "stock_value",
    label: "Stock Value",
    field: "invoice",
    format: (value, row) => {
      if (value) {
        return (
          (row.stock * value.unit_price).toPrecision(4) +
          " " +
          value.price_currency
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
        return value.unit_price + " " + value.price_currency;
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

    function save_edited_storage_location(storage_location) {
      storage_location_edit_dialog.value = false;
      const id = route.params.id;
      var folder_id = null;

      if (storage_location.folder) {
        folder_id = storage_location.folder.id;
      }
      const data = {
        id: id,
        location: storage_location.name,
        description: storage_location.description,
        folder_id: folder_id,
      };
      api
        .put(`api/storage_location/${id}/`, data)
        .then((response) => {
          name.value = response.data.name;
          parts.value = response.data.rows;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function load_storage_location_data(id) {
      loading.value = true;
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

    function load_folders_data() {
      api
        .post(`inventory/api/storage_location/folders_list`)
        .then((response) => {
          storage_locations_folders.value = response.data.rows;
        })
        .finally(() => {});
    }

    onMounted(() => {
      load_folders_data();
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

      onRequest,
      load_storage_location_data,
      delete_location,
      show_history,
      save_edited_storage_location,
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
        this.load_storage_location_data(toParams.id);
      }
    );
  },
};
</script>
