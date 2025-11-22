<template>
  <q-toolbar>
    <q-btn
      flat
      dense
      round
      icon="menu"
      aria-label="Menu"
      @click="$emit('toggleLeftDrawer')"
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
          <q-item clickable @click="$emit('importDialog')">
            <q-item-section>Import</q-item-section>
          </q-item>

          <q-item clickable @click="$emit('exportDialog')">
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

    <q-btn dense flat no-wrap>
      <q-avatar rounded size="32px">
        <img :src="users_store.me.avatar" />
      </q-avatar>
      <q-icon name="arrow_drop_down" size="20px" />

      <q-menu auto-close>
        <q-list dense>
          <q-item>
            <q-item-section>
              <div>
                Signed in as <strong>{{ users_store.me.username }}</strong>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable disable>
            <q-item-section>Your profile</q-item-section>
          </q-item>
          <q-item clickable disable>
            <q-item-section>Your projects</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable disable>
            <q-item-section>Help</q-item-section>
          </q-item>
          <q-item clickable disable>
            <q-item-section>Settings</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section @click="onSignOut">Sign out</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <div>Quasar v{{ $q.version }}</div>
    <q-btn dense flat round icon="menu" @click="$emit('toggleRightDrawer')" />
  </q-toolbar>
</template>

<script>
import { defineComponent } from "vue";
import { api } from "boot/axios";
import { useUsersStore } from "stores/users";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainToolbar",
  setup(props) {
    const users_store = useUsersStore();

    users_store.fetchData();

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

    function onSignOut() {
      $q.localStorage.removeItem("token");
      router.push({ path: "/login" });
    }

    return {
      update_parts,
      update_distributors_and_inventory,
      update_partsdb,
      users_store,
      onSignOut,
    };
  },
});
</script>
