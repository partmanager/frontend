<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <MainToolbar
        @toggleLeftDrawer="toggleLeftDrawer"
        @toggleRightDrawer="toggleRightDrawer"
        @importDialog="import_dialog = true"
        @exportDialog="export_dialog = true"
      ></MainToolbar>
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
import { defineComponent, onUpdated, ref, watch } from "vue";
import { api } from "boot/axios";
import { onMounted } from "vue";
import ExportDialog from "src/components/ExportDialog.vue";
import ImportDialog from "src/components/ImportDialog.vue";
import MainToolbar from "components/MainToolbar.vue";

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

    watch(
      () => props.api_url,
      (current, previous) => {
        console.log(current, previous);
        api.get(props.api_url).then((response) => {
          simple.value = [response.data];
        });
      }
    );

    onMounted(() => {
      api.get(props.api_url).then((response) => {
        simple.value = [response.data];
      });
    });

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
    };
  },
  components: { MainToolbar, ExportDialog, ImportDialog },
});
</script>
