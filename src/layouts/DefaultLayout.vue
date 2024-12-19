<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <MainToolbar
        @toggleLeftDrawer="toggleLeftDrawer"
        @toggleRightDrawer="toggleRightDrawer"
        @importDialog="import_dialog = true"
        @exportDialog="export_dialog = true"
      ></MainToolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <ExportDialog v-model="export_dialog"> </ExportDialog>
    <ImportDialog v-model="import_dialog"></ImportDialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import ExportDialog from "src/components/ExportDialog.vue";
import ImportDialog from "src/components/ImportDialog.vue";
import MainToolbar from "components/MainToolbar.vue";

export default defineComponent({
  name: "DefaultLayout",
  setup(props) {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const export_dialog = ref(false);
    const import_dialog = ref(false);

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
    };
  },
  components: { MainToolbar, ExportDialog, ImportDialog },
});
</script>
