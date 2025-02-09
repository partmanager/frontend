<template>
  <div class="q-pa-md">
    <q-btn
      color="secondary"
      :disable="loading"
      label="Create Manufacturer"
      @click="create_manufacturer_dialog = true"
    />

    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="details" label="Details" />
      <q-tab name="parts" label="Parts" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="details">
        <strong>Name:</strong> {{ manufacturer.name }} <br />
        <strong>Full Name:</strong> {{ manufacturer.full_name }} <br />
        <strong>Address:</strong> {{ manufacturer.address }} <br />
        <strong>Website:</strong> {{ manufacturer.website }} <br />
        <strong>Email:</strong> {{ manufacturer.email }} <br />
        <strong>Phone:</strong> {{ manufacturer.phone }} <br />
        <strong>Comment:</strong> {{ manufacturer.comment }} <br />
        <br />
        <q-btn
          color="primary"
          :disable="loading"
          label="Edit"
          @click="edit_manufacturer = true"
        />
        <q-btn
          color="red"
          :disable="loading"
          label="Delete"
          @click="delete_configration = true"
        />
        <br />
        <br />
        <q-separator />
        <br />
        <strong>Parts Count:</strong> {{ manufacturer.part_count }} <br />
        <strong>Manufacturer Order Number Count:</strong>
        {{ manufacturer.order_number_count }}
      </q-tab-panel>
      <q-tab-panel name="parts">
        <ManufacturerPartSeriesTable :rows="parts_series" :loading="loading">
        </ManufacturerPartSeriesTable>
      </q-tab-panel>
    </q-tab-panels>

    <DeleteConfirmationDialog
      v-model="delete_configration"
      :title="'Delete Manufacturer'"
      :ondelete="delete_manufacturer"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ manufacturer.name }}</strong> manufacturer?
      </template>
    </DeleteConfirmationDialog>

    <ManufacturerEditCreateDialog
      v-model="create_manufacturer_dialog"
      :title="'Create Manufacturer'"
      :onsave="create_manufacturer"
    >
    </ManufacturerEditCreateDialog>

    <ManufacturerEditCreateDialog
      v-model="edit_manufacturer"
      :title="'Edit Manufacturer'"
      :manufacturer_initial_data="manufacturer"
      :onsave="update_manufacturer"
    >
    </ManufacturerEditCreateDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import ManufacturerPartSeriesTable from "../components/ManufacturerPartSeriesTable.vue";
import ManufacturerEditCreateDialog from "src/components/ManufacturerEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const manufacturer = ref({
  name: "",
  full_name: "",
  id: null,
});
const parts_series = ref([]);
const loading = ref(false);

function load_manufacturer_detail(id) {
  loading.value = true;
  api
    .get(`/api/manufacturer/${id}`)
    .then((response) => {
      manufacturer.value = response.data;
      parts_series.value = response.data.seriesData;
    })
    .finally(() => {
      loading.value = false;
    });
}

export default {
  setup() {
    const route = useRoute();
    const delete_configration = ref();
    const edit_manufacturer = ref();
    const create_manufacturer_dialog = ref();

    function create_manufacturer(manufacturer_data) {
      api.post("/api/manufacturer/", manufacturer_data).then((response) => {
        if (response.data.id) {
          create_manufacturer_dialog.value = false;
        }
      });
    }

    function update_manufacturer(manufacturer_data) {
      api
        .put(`/api/manufacturer/${manufacturer.value.id}/`, manufacturer_data)
        .then((response) => {
          if (response.data.id) {
            edit_manufacturer.value = false;
            load_manufacturer_detail(route.params.id);
          }
        });
    }

    function api_call_delete_invoice_item() {
      api
        .delete(`/api/manufacturer/${manufacturer.value.id}/`)
        .then((response) => {});
    }

    function delete_manufacturer() {
      api_call_delete_invoice_item();
      delete_configration.value = false;
    }

    onMounted(() => {
      load_manufacturer_detail(route.params.id);
    });

    return {
      tab: ref("details"),
      manufacturer,
      parts_series,
      loading,
      delete_configration,
      edit_manufacturer,
      create_manufacturer_dialog,

      delete_manufacturer,
      create_manufacturer,
      update_manufacturer,
    };
  },
  components: {
    ManufacturerPartSeriesTable,
    ManufacturerEditCreateDialog,
    DeleteConfirmationDialog,
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        if (toParams.id) {
          load_manufacturer_detail(toParams.id);
        }
      }
    );
  },
};
</script>
