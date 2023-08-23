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
          <q-route-tab to="/distributors" label="Distributors" exact />
          <q-route-tab to="/manufacturers" label="Manufacturers" exact />
          <q-route-tab to="/manufacturers" label="Tools" />
        </q-tabs>
        <div>Quasar v{{ $q.version }}</div>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-btn
        label="Create Distributor"
        @click="distributor_create_dialog_model = true"
        color="secondary"
      ></q-btn>
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

    <DistributorEditCreateDialog
      v-model="distributor_create_dialog_model"
      title="Create Distributor"
      :onsave="onDistributorCreate"
    ></DistributorEditCreateDialog>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { api } from "boot/axios";
import { onMounted, onUpdated } from "vue";
import DistributorEditCreateDialog from "../components/DistributorEditCreateDialog.vue";

export default defineComponent({
  name: "DistributorLayout",
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
    const distributor_create_dialog_model = ref();

    function onDistributorCreate() {
      distributor_create_dialog_model.value = false;
      load();
    }

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
      distributor_create_dialog_model,

      myFilterMethod(node, filter) {
        const filt = filter.toLowerCase();
        return node.label && node.label.toLowerCase().indexOf(filt) > -1;
      },
      resetFilter() {
        filter.value = "";
        filterRef.value.focus();
      },
      onDistributorCreate,
    };
  },
  components: { DistributorEditCreateDialog },
});
</script>
