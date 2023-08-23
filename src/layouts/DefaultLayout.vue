<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
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
              <q-item clickable @click="tab = 'Import'">
                <q-item-section>Import</q-item-section>
              </q-item>

              <q-item clickable @click="tab = 'Export'">
                <q-item-section>Export</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
