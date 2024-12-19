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

      <q-list dense bordered separator>
        <q-item
          v-for="contact in simple"
          :props="props"
          :key="contact.id"
          clickable
          v-ripple
          :active="active === contact.id"
          @click="
            {
              active = contact.pk;
              this.$router.push(router_url + contact.id);
            }
          "
        >
          <q-item-section>
            <q-item-label>{{ contact.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
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
import { defineComponent, ref } from "vue";
import { api } from "boot/axios";
import { onMounted, onUpdated } from "vue";
import ExportDialog from "src/components/ExportDialog.vue";
import ImportDialog from "src/components/ImportDialog.vue";
import MainToolbar from "components/MainToolbar.vue";

export default defineComponent({
  name: "MainListLayout",
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
    const active = ref();
    const export_dialog = ref(false);
    const import_dialog = ref(false);

    function load() {
      api.get(props.api_url).then((response) => {
        if (response.data.rows) {
          simple.value = response.data.rows;
        } else {
          simple.value = response.data;
        }
      });
    }

    onMounted(() => {
      load();
    });

    onUpdated(() => {
      load();
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
      active,

      myFilterMethod(node, filter) {
        const filt = filter.toLowerCase();
        return node.label && node.label.toLowerCase().indexOf(filt) > -1;
      },
      resetFilter() {
        filter.value = "";
        filterRef.value.focus();
      },
      props,
    };
  },
  components: { MainToolbar, ExportDialog, ImportDialog },
});
</script>
