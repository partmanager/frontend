<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Shelftracker
        </q-toolbar-title>

        <q-tabs align="left">
          <q-route-tab to="/inventory" label="Inventory" />
          <q-route-tab to="/parts" label="Parts" />
          <q-route-tab to="/projects" label="Projects" />
          <q-route-tab to="/invoices" label="Invoices" />
          <q-route-tab to="/storage_location" label="Storage Locations" />
          <q-route-tab to="/distributors" label="Distributors" />
          <q-route-tab to="/manufacturers" label="Manufacturers" />
          <q-route-tab to="/manufacturers" label="Tools" />
        </q-tabs>
        <div>Quasar v{{ $q.version }}</div>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-card>
        <q-card-section>
          <div class="row">
            <q-btn
              label="Create Location"
              @click="create_storage_location = true"
              color="primary"
              class="col"
            ></q-btn>
            <q-btn
              label="Create Folder"
              @click="create_storage_folder = true"
              color="primary"
              class="col"
            ></q-btn>
          </div>
          <q-checkbox
            v-model="show_empty_only"
            label="Show only empty locations"
            @update:model-value="on_show_empty_only_updated"
          />
        </q-card-section>
      </q-card>
      <q-input ref="filterRef" filled v-model="filter" label="Search">
        <template v-slot:append>
          <q-icon
            v-if="filter !== ''"
            name="clear"
            class="cursor-pointer"
            @click="resetFilter"
          />
        </template>
      </q-input>

      <q-tree
        :nodes="simple"
        node-key="id"
        label-key="name"
        dense
        default-expand-all
        :filter="filter"
        :filter-method="myFilterMethod"
        v-model:selected="selected"
        @update:selected="this.$router.push(router_url + selected)"
      />
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <StorageLocationEditCreateDialog
      v-model="create_storage_location"
      title="Create Storage Location"
      :folders="storage_locations_folders"
      :onsave="api_create_storage_location"
    ></StorageLocationEditCreateDialog>

    <StorageFolderEditCreateDialog
      v-model="create_storage_folder"
      title="Create Storage Folder"
      :onsave="on_folder_created"
    >
    </StorageFolderEditCreateDialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { api } from "boot/axios";
import { onMounted } from "vue";
import StorageLocationEditCreateDialog from "src/components/StorageLocationEditCreateDialog.vue";
import StorageFolderEditCreateDialog from "src/components/StorageFolderEditCreateDialog.vue";

export default defineComponent({
  name: "MainLayout",
  props: {
    api_url: {
      type: String,
    },
    router_url: {
      type: String,
    },
  },
  setup(props) {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const selected = ref(null);
    const filter = ref(null);
    const filterRef = ref(null);
    const simple = ref([]);
    const show_empty_only = ref(false);
    const create_storage_location = ref();
    const create_storage_folder = ref();
    const storage_locations_folders = ref([]);

    function load_folders_data() {
      api
        .post(`inventory/api/storage_location/folders_list`)
        .then((response) => {
          storage_locations_folders.value = response.data.rows;
        })
        .finally(() => {});
    }

    function api_create_storage_location(storage_location) {
      var folder_id = null;
      if (storage_location.folder) {
        folder_id = storage_location.folder.id;
      }
      const data = {
        location: storage_location.name,
        description: storage_location.description,
        folder: folder_id,
      };
      api
        .post(`/api/storage_location/`, data)
        .then((response) => {
          create_storage_location.value = false;
        })
        .finally(() => {
          //loading.value = false;
        });
    }

    function on_folder_created() {
      create_storage_folder.value = false;
    }

    function on_show_empty_only_updated(value, event) {
      api
        .get(props.api_url, { params: { empty_only: value } })
        .then((response) => {
          simple.value = [response.data];
        });
    }
    onMounted(() => {
      load_folders_data();
      api
        .get(props.api_url, { params: { empty_only: false } })
        .then((response) => {
          simple.value = [response.data];
        });
    });
    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
      selected,
      filter,
      filterRef,
      simple,
      show_empty_only,
      myFilterMethod(node, filter) {
        const filt = filter.toLowerCase();
        return node.name && node.name.toLowerCase().indexOf(filt) > -1;
      },
      resetFilter() {
        filter.value = "";
        filterRef.value.focus();
      },
      on_show_empty_only_updated,
      create_storage_location,
      storage_locations_folders,
      create_storage_folder,
      api_create_storage_location,
      on_folder_created,
    };
  },
  components: {
    StorageLocationEditCreateDialog,
    StorageFolderEditCreateDialog,
  },
});
</script>
