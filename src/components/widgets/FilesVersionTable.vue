<template>
  <q-table :columns="columns">
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn
            size="sm"
            color="accent"
            round
            dense
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'remove' : 'add'"
          />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <div v-if="col.name == 'filename'">
            <div class="row">
              <div class="col">
                <a :disable="!props.row.url" :href="props.row.url">{{
                  col.value
                }}</a>
              </div>
              <div class="col">
                <a :href="props.row.fileversion_set[0].file">cached</a>
              </div>
            </div>
          </div>
          <div v-else>
            {{ col.value }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <q-table
            hide-bottom
            :columns="[
              {
                name: 'filename',
                label: 'Filename',
                align: 'left',
                field: 'name',
              },
              {
                name: 'version',
                label: 'Version',
                align: 'left',
                field: 'version',
              },
              {
                name: 'date',
                label: 'Date',
                align: 'left',
                field: 'publication_date',
              },
              {
                name: 'md5',
                label: 'md5 sum',
                align: 'left',
                field: 'md5sum',
              },
            ]"
            :rows="props.row.fileversion_set"
            ><template v-slot:body-cell-filename="props">
              <q-td :props="props">
                <div class="row">
                  <div class="col">
                    <a :disable="!props.row.url" :href="props.row.url">File</a>
                  </div>
                  <div class="col">
                    <a :href="props.row.file">cached</a>
                  </div>
                </div>
              </q-td>
            </template></q-table
          >
        </q-td>
      </q-tr>
    </template>

    <template v-slot:body-cell-filename="props">
      <q-td :props="props">
        <div class="row">
          <div class="col">
            <a :href="props.row.url">{{ props.value }}</a>
          </div>
          <div class="col">
            <a :href="props.row.fileversion_set[0].file">cached</a>
          </div>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
const columns = [
  {
    name: "filename",
    label: "Filename",
    align: "left",
    field: "name",
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "version",
    label: "Version",
    align: "left",
    field: "series",
  },
  {
    name: "file_type",
    label: "File Type",
    align: "left",
    field: "file_type",
  },
];

import { defineComponent } from "vue";

export default defineComponent({
  name: "FilesVersionTable",
  props: {},
  setup(props) {
    return { columns };
  },
});
</script>
