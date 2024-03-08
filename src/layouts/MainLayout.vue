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
          <q-btn-dropdown auto-close stretch flat label="Tools">
            <q-list>
              <q-item clickable @click="import_dialog = true">
                <q-item-section>Import</q-item-section>
              </q-item>

              <q-item clickable @click="export_dialog = true">
                <q-item-section>Export</q-item-section>
              </q-item>

              <q-item clickable @click="update_parts">
                <q-item-section>Update parts</q-item-section>
              </q-item>
              <q-item clickable @click="update_distributors_and_inventory">
                <q-item-section
                  >Update distributors MON and inventory MON</q-item-section
                >
              </q-item>
              <q-item clickable @click="update_partsdb">
                <q-item-section>Update Parts DB</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-tabs>
        <div>Quasar v{{ $q.version }}</div>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
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
    <ExportDialog v-model="export_dialog"> </ExportDialog>
    <ImportDialog v-model="import_dialog"></ImportDialog>
  </q-layout>
</template>

<script>
import { defineComponent, onUpdated, ref } from "vue";
import { api } from "boot/axios";
import { onMounted } from "vue";
import ExportDialog from "src/components/ExportDialog.vue";
import ImportDialog from "src/components/ImportDialog.vue";

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
    const export_dialog = ref(false);
    const import_dialog = ref(false);

    onMounted(() => {
      api.get(props.api_url).then((response) => {
        simple.value = [response.data];
      });
    });

    function update_parts() {
      api.get("/parts/api/part/import").then((response) => {});
    }

    function update_distributors_and_inventory() {
      api.get("/distributors/api/update/").then((response) => {});
      api.get("/inventory/api/update").then((response) => {});
    }

    function update_partsdb() {
      api.post("/updategit").then((response) => {});
    }

    return {
      export_dialog,
      import_dialog,

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
      myFilterMethod(node, filter) {
        const filt = filter.toLowerCase();
        return node.label && node.label.toLowerCase().indexOf(filt) > -1;
      },
      resetFilter() {
        filter.value = "";
        filterRef.value.focus();
      },
      update_parts,
      update_distributors_and_inventory,
      update_partsdb,
    };
  },
  components: { ExportDialog, ImportDialog },
});
</script>
