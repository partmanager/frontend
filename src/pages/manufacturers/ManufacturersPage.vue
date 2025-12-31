<template>
  <div class="q-pa-md">
    <q-table
      title="Manufacturers"
      row-key="id"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :filter="search"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:top>
        <div class="q-pa-md q-gutter-sm">
          <div class="q-table__title">Manufacturers</div>
          <q-btn
            color="primary"
            label="Add"
            title="Add invoice"
            @click="create_dialog = true"
          />
          <q-btn color="primary" label="Import" @click="import_dialog = true" />
        </div>
        <q-space />
        <q-input
          borderless
          dense
          debounce="300"
          v-model="search"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div>
            <a :href="'#/manufacturers/' + props.row.id">{{ props.value }}</a>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn
              padding="xs"
              color="primary"
              icon="info"
              title="Open invoice origingal file or scan"
              :href="props.row.website_url"
              :disable="!props.row.website_url"
            />
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="editManufacturer(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete invoice"
              @click="deleteManufacturer(props.row)"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-website="props">
        <q-td :props="props">
          <div>
            <a :href="props.value">{{ props.value }}</a>
          </div>
        </q-td>
      </template>
    </q-table>

    <ManufacturerEditCreateDialog
      v-model="create_dialog"
      title="Create Manufacturer"
      :onsave="onManufacturerCreate"
    ></ManufacturerEditCreateDialog>

    <ManufacturerEditCreateDialog
      v-model="edit_dialog"
      title="Edit Manufacturer"
      :distributor_initial_id="active_manufacturer"
      :onsave="onManufacturerEdit"
    ></ManufacturerEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="delete_confirmation_dialog"
      :title="'Delete Manufacturer'"
      :ondelete="onManufacturerDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_manufacturer.name }}</strong> distributor?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { api_delete_distributor } from "src/boot/distributor_set";
import ManufacturerEditCreateDialog from "src/components/ManufacturerEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const columns = [
  {
    name: "name",
    label: "Manufacturer name",
    align: "left",
    field: "name",
  },
  {
    name: "fullName",
    label: "Manufacturer full name",
    align: "left",
    field: "full_name",
  },
  { name: "action", label: "Action", align: "left" },
  {
    name: "website",
    label: "Website",
    align: "left",
    field: "website",
  },
  {
    name: "comment",
    label: "Comment",
    align: "left",
    field: "comment",
  },
];

export default {
  components: { ManufacturerEditCreateDialog, DeleteConfirmationDialog },
  setup() {
    const rows = ref([]);
    const search = ref("");
    const loading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    const active_manufacturer = ref();
    const import_dialog = ref();
    const create_dialog = ref();
    const edit_dialog = ref();
    const delete_confirmation_dialog = ref(false);

    function onManufacturerCreate() {
      create_dialog.value = false;
      onRequest({
        pagination: pagination.value,
        search: search,
      });
    }

    function editManufacturer(data) {
      active_manufacturer.value = data;
      edit_dialog.value = true;
    }

    function onManufacturerEdit() {
      // api_delete_distributor(route.params.id);
      edit_dialog.value = false;
    }

    function deleteManufacturer(data) {
      active_manufacturer.value = data;
      delete_confirmation_dialog.value = true;
    }

    function onManufacturerDelete() {
      api_delete_distributor(active_manufacturer.value.id).finally(() => {
        delete_confirmation_dialog.value = false;
        onRequest({
          pagination: pagination.value,
          filter: filter,
        });
      });
    }

    function onRequest(props) {
      loading.value = true;
      let params = {
        search: search.value,
        pageSize: props.pagination.rowsPerPage,
        pageNumber: props.pagination.page,
      };

      api
        .get("/api/manufacturer/", {
          params,
        })
        .then((response) => {
          pagination.value.page = props.pagination.page;
          pagination.value.rowsPerPage = props.pagination.rowsPerPage;
          pagination.value.rowsNumber = response.data.count;
          rows.value = response.data.results;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    onMounted(() => {
      // get initial data from server (1st page)
      onRequest({
        pagination: pagination.value,
        search: undefined,
      });
    });

    return {
      columns,
      rows,
      loading,
      pagination,
      search,
      onRequest,

      active_manufacturer,

      import_dialog,
      create_dialog,
      onManufacturerCreate,

      edit_dialog,
      editManufacturer,
      onManufacturerEdit,

      delete_confirmation_dialog,
      deleteManufacturer,
      onManufacturerDelete,
    };
  },
};
</script>
