<template>
  <div class="q-pa-md">
    <q-table
      title="Distributors"
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
          <div class="q-table__title">Distributors</div>
          <q-btn
            color="primary"
            label="Add"
            title="Add invoice"
            @click="distributor_create_dialog = true"
          />
          <q-btn
            color="primary"
            label="Import"
            @click="distributor_import_dialog = true"
          />
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

      <template v-slot:body-cell-distributor="props">
        <q-td :props="props">
          <div>
            <a :href="'#/distributors/' + props.row.id">{{ props.value }}</a>
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
              @click="editDistributor(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete invoice"
              @click="delete_distributor(props.row)"
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

    <DistributorEditCreateDialog
      v-model="distributor_create_dialog"
      title="Create Distributor"
      :onsave="onDistributorCreate"
    ></DistributorEditCreateDialog>

    <DistributorEditCreateDialog
      v-model="distributor_edit_dialog_model"
      title="Edit Distributor"
      :distributor_initial_id="active_distributor_id"
      :onsave="onDistributorEdit"
    ></DistributorEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="delete_confirmation_dialog"
      :title="'Delete Distributor'"
      :ondelete="onDistributorDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_distributor.name }}</strong> distributor?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { api_delete_distributor } from "src/boot/distributor_set";
import DistributorEditCreateDialog from "src/components/DistributorEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const columns = [
  {
    name: "distributor",
    label: "Distributor",
    align: "left",
    field: "name",
  },
  { name: "action", label: "Action", align: "left" },
  {
    name: "website",
    label: "Website",
    align: "left",
    field: "website_url",
  },
];

export default {
  components: { DistributorEditCreateDialog, DeleteConfirmationDialog },
  setup() {
    const rows = ref([]);
    const search = ref("");
    const loading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    const active_distributor = ref();
    const active_distributor_id = ref(null);
    const distributor_import_dialog = ref();
    const distributor_create_dialog = ref();
    const distributor_edit_dialog_model = ref();
    const delete_confirmation_dialog = ref(false);

    function onDistributorCreate() {
      distributor_create_dialog.value = false;
      onRequest({
        pagination: pagination.value,
      });
    }

    function editDistributor(data) {
      active_distributor_id.value = data.id;
      distributor_edit_dialog_model.value = true;
    }

    function onDistributorEdit() {
      onRequest({
        pagination: pagination.value,
        search: search.value,
      });
      distributor_edit_dialog_model.value = false;
    }

    function delete_distributor(data) {
      active_distributor.value = data;
      delete_confirmation_dialog.value = true;
    }

    function onDistributorDelete() {
      api_delete_distributor(active_distributor.value.id).finally(() => {
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
        .get("/api/distributor/", {
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
      });
    });

    return {
      columns,
      rows,
      loading,
      pagination,
      search,
      onRequest,

      active_distributor,
      active_distributor_id,

      distributor_import_dialog,
      distributor_create_dialog,
      onDistributorCreate,

      distributor_edit_dialog_model,
      editDistributor,
      onDistributorEdit,

      delete_confirmation_dialog,
      delete_distributor,
      onDistributorDelete,
    };
  },
};
</script>
