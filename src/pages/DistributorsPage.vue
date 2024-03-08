<template>
  <div class="q-pa-md">
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
      <q-tab name="manufacturers" label="Manufacturers" />
      <q-tab name="parts" label="Parts" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="details">
        <strong>Name:</strong> {{ distributor_name }} <br />
        <strong>Website:</strong> {{ distributor_website }} <br />
        <br />
        <q-btn
          color="primary"
          :disable="loading"
          label="Edit"
          @click="distributor_edit_dialog_model = true"
        />
        <q-btn
          color="red"
          :disable="loading"
          label="Delete"
          @click="delete_confirmation_dialog = true"
        />
        <br />
        <br />
        <q-separator />
        <br />
        <strong>Parts Count:</strong> {{ distirbutor_parts_count }} <br />
        <strong>Parts Without Manufacturer Part Number Count:</strong>
        {{ distibutor_missing_mon_parts_count }}
      </q-tab-panel>

      <q-tab-panel name="manufacturers">
        <DistributorManufacturersNameConversionTable
          :loading="distributor_manufacturer_name_conversion_table_loading"
          :distributor_name="distributor_name"
          :rows="distributor_manufacturer_name_conversion_table_rows"
        >
        </DistributorManufacturersNameConversionTable>
      </q-tab-panel>

      <q-tab-panel name="parts">
        <DistributorOrderNumberTable
          :distributor_id="active_id"
          :distributor_name="distributor_name"
        >
        </DistributorOrderNumberTable>
      </q-tab-panel>
    </q-tab-panels>

    <DistributorEditCreateDialog
      v-model="distributor_edit_dialog_model"
      title="Edit Distributor"
      :distributor_initial_id="active_id"
      :onsave="onDistributorEdit"
    ></DistributorEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="delete_confirmation_dialog"
      :title="'Delete Distributor'"
      :ondelete="onDistributorDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ distributor_name }}</strong> distributor?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";
import { delete_distributor } from "src/boot/distributor_set";
import DistributorEditCreateDialog from "../components/DistributorEditCreateDialog.vue";
import DistributorManufacturersNameConversionTable from "src/components/DistributorManufacturersNameConversionTable.vue";
import DistributorOrderNumberTable from "../components/DistributorOrderNumberTable.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const distributor_manufacturer_name_conversion_table_loading = ref(false);
const distributor_manufacturer_name_conversion_table_rows = ref([]);
const distributor_name = ref();
const distributor_website = ref();
const distirbutor_parts_count = ref();
const distibutor_missing_mon_parts_count = ref();

function load_distributor_detail(id) {
  api.get(`/api/distributor/${id}/`).then((response) => {
    distributor_name.value = response.data.name;
    distributor_website.value = response.data.website_url;

    distirbutor_parts_count.value = response.data.part_count;
    distibutor_missing_mon_parts_count.value =
      response.data.part_without_mon_count;
  });
}

function load_distributor_manufacturers(id) {
  distributor_manufacturer_name_conversion_table_loading.value = true;
  api
    .get(`/api/distributor-manufacturer/?distributor=${id}`)
    .then((response) => {
      distributor_manufacturer_name_conversion_table_rows.value = response.data;
    });
  distributor_manufacturer_name_conversion_table_loading.value = false;
}

export default {
  setup() {
    const route = useRoute();
    const active_id = ref(Number(route.params.id));
    const distributor_order_numbers_table = ref();
    const filter = ref("");
    const distributor_edit_dialog_model = ref();
    const delete_confirmation_dialog = ref();
    const loading = ref();

    function onDistributorEdit() {
      distributor_edit_dialog_model.value = false;
    }

    function onDistributorDelete() {
      delete_distributor(route.params.id);
      delete_confirmation_dialog.value = false;
    }

    onMounted(() => {
      load_distributor_detail(route.params.id);
      load_distributor_manufacturers(route.params.id);
    });

    return {
      tab: ref("details"),

      loading,

      distributor_name,
      distributor_website,

      distirbutor_parts_count,
      distibutor_missing_mon_parts_count,

      distributor_edit_dialog_model,
      distributor_manufacturer_name_conversion_table_loading,
      distributor_manufacturer_name_conversion_table_rows,

      distributor_order_numbers_table,
      filter,

      delete_confirmation_dialog,

      active_id,

      onDistributorEdit,
      onDistributorDelete,
    };
  },
  components: {
    DistributorEditCreateDialog,
    DistributorManufacturersNameConversionTable,
    DistributorOrderNumberTable,
    DeleteConfirmationDialog,
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        load_distributor_detail(toParams.id);
        load_distributor_manufacturers(toParams.id);
      }
    );
  },
};
</script>
