<template>
  <div class="q-pa-md">
    <q-card align="justify">
      <q-card-section>
        <div class="text-h6">
          {{ project.name }} -> {{ project_version.name }} ->
          {{ assembly.name }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        Project version: {{ project_version.name }}<br />
        Description: {{ assembly.description }} <br />
        <strong>Quantity: {{ assembly.quantity }}</strong
        ><br />
        Total Price: {{ assembly.price }} <br />
      </q-card-section>

      <q-card-actions>
        <q-btn
          color="primary"
          label="Edit"
          title="Edit Assembly"
          @click="assembly_edit_dialog = true"
        />
        <q-btn
          color="primary"
          label="Reserve Components"
          title="Reserve Components"
          @click="assembly_edit_dialog = true"
        />
        <q-btn
          color="primary"
          label="Realese Components"
          title="Realese Components"
          @click="assembly_edit_dialog = true"
        />
        <q-btn
          color="secondary"
          label="Close Assembly"
          title="Close Assembly"
          @click="closeRework"
        />
        <q-btn
          color="secondary"
          label="Delete"
          title="Delete Assembly"
          @click="assembly_delete_dialog = true"
        />
        <q-btn
          color="secondary"
          label="Generate Assemblies"
          title="Generate Assembly"
          @click="generate_assemblies"
        />
      </q-card-actions>
    </q-card>
    <br />
    <q-table title="Parts" :columns="columns" :rows="items" :wrap-cells="true">
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
            <div v-if="col.name != 'quantity' && col.name != 'action'">
              {{ col.value }}
            </div>
            <!-- Quantity column formating-->
            <div v-if="col.name == 'quantity'">
              <q-badge
                v-if="!props.row.part && !props.row.manufacturer_order_number"
                color="red"
                title="Part unassigned."
              >
                <q-icon name="warning" color="white" class="q-ml-xs" />
              </q-badge>
              <q-badge
                v-if="props.row.quantity > props.row.available_qty"
                color="yellow-6"
                text-color="black"
                title="Not enough parts on stock"
              >
                <q-icon class="q-ml-xs" name="warning"></q-icon>
              </q-badge>
              {{ col.value }}
            </div>
            <!-- Action column formating-->
            <div v-if="col.name == 'action'">
              <q-btn
                padding="xs"
                color="primary"
                icon="edit"
                title="Edit"
                @click="show_bom_item_edit_dialog(props.row)"
              />
              <q-btn
                padding="xs"
                color="red"
                icon="delete"
                title="Delete"
                @click="show_delete_confirmation_dialog(props.row)"
              />
            </div>
          </q-td>
        </q-tr>
        <!-- Expandable detail row -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <q-card
              ><q-card-section>
                <q-checkbox
                  v-model="props.row.place"
                  label="Assembly part"
                ></q-checkbox>
                <q-checkbox
                  v-model="props.row.sourced_externally"
                  label="Sourced externally by assembly house"
                  :disable="!props.row.place"
                ></q-checkbox>
                <q-btn
                  label="Apply to all"
                  color="primary"
                  @click="update_assembly_items_data(props.row)"
                ></q-btn>
              </q-card-section>
            </q-card>
            <!-- Part sources table -->
            <AlternativeLocationTable
              v-if="props.row.place && !props.row.sourced_externally"
              title="Part Locations"
              :part_id="props.row.part.id"
            ></AlternativeLocationTable>

            <br />
            <!-- Parts origins table-->
            <q-table
              title="Parts to assembly"
              :columns="[
                {
                  name: 'designator',
                  label: 'Designator',
                  align: 'left',
                  field: 'designator',
                },
                {
                  name: 'assembly',
                  label: 'Assembly Name',
                  align: 'left',
                  field: 'assembly',
                },
                {
                  name: 'assembly_sn',
                  label: 'Serial Number',
                  align: 'left',
                  field: 'assembly_sn',
                },
                {
                  name: 'assembled',
                  label: 'Assembly?',
                  align: 'left',
                  field: 'assembled',
                },
                {
                  name: 'sourced_externally',
                  label: 'Externally sourced?',
                  align: 'left',
                  field: 'sourced_externally',
                },
              ]"
              :rows="props.row.assembly_items"
            ></q-table>

            <br />
            <q-separator />
            <div class="text-left">Part ID: {{ props.row.part.id }}</div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <AssemblyEditCreateDialog
      v-model="assembly_edit_dialog"
      title="Edit Assembly"
      :assembly_initial_id="active_id"
      :project_id="project.id"
      :onsave="on_assembly_save"
    ></AssemblyEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="assembly_delete_dialog"
      :title="'Delete Assembly'"
      :ondelete="on_assembly_delete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ assembly.name }}</strong>
        assembly from <strong>{{ project.name }}</strong
        >?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";
import AssemblyEditCreateDialog from "components/AssemblyEditCreateDialog.vue";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import { quantity_unit_id_to_name } from "boot/choices";
import AlternativeLocationTable from "components/AlternativeLocationTable.vue";

const columns = [
  {
    name: "quantity",
    label: "Quantity",
    field: "assembly_items",
    sortable: true,
    format: (val) => {
      return val.length;
    },
  },
  {
    name: "reserved_qty",
    label: "Reserved Quantity",
    field: "reserved_qty",
  },
  {
    name: "price",
    label: "Parts price",
    field: "price",
    sortable: true,
  },
  { name: "action", label: "Action", align: "left", field: "id" },
  {
    name: "manufacturer",
    label: "Manufacturer",
    field: "part",
    format: (val, row) => {
      if (val) {
        return val.manufacturer;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.manufacturer;
      }
    },
  },
  {
    name: "mpn",
    label: "MPN",
    field: "part",
    format: (val, row) => {
      if (val) {
        return val.manufacturer_part_number;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.MPN;
      }
    },
  },
  {
    name: "mon",
    label: "MON",
    field: "manufacturer_order_number",
    format: (val, row) => {
      if (val) {
        return val.manufacturer_order_number;
      } else if (row.part_not_found_fallback) {
        return row.part_not_found_fallback.MON;
      }
    },
  },
  {
    name: "desc",
    label: "Description",
    field: "part",
    format: (val, row) => {
      if (val) {
        return val.description;
      }
    },
  },
];

export default {
  setup() {
    const route = useRoute();
    const active_id = Number(route.params.id);

    const assembly_edit_dialog = ref();
    const assembly_delete_dialog = ref();

    const project = ref({ id: null, name: null });
    const project_version = ref({ id: null, name: null });
    const assembly = ref({
      id: active_id,
      name: null,
      description: null,
      quantity: null,
      price: 0,
    });

    const items = ref([]);

    function update_assembly_items_data(row) {
      var data = {
        assembled: row.place,
        sourced_externally: row.sourced_externally,
      };
      for (let assembly_item of row.assembly_items) {
        console.log(assembly_item);
        api.patch(`/api/assembly-item/${assembly_item.id}/`, data);
      }
      reload();
    }

    function load_assembly_items() {
      api
        .get(`api/assembly-item/?assembly__assembly_job=${active_id}`)
        .then((response) => {
          // items.value = response.data;
          var obj = Object.groupBy(response.data, (x) => x.part.id);

          items.value = Object.keys(obj).map((key) => ({
            id: Number(key),
            part: obj[key][0].part,
            place: obj[key][0].assembled,
            sourced_externally: obj[key][0].sourced_externally,
            assembly_items: obj[key],
          }));
          console.log(items.value);
        });
    }

    function load_assembly_details() {
      api.get(`/api/assembly-job/${active_id}`).then((response) => {
        project.value = response.data.project_version.project;
        project_version.value = response.data.project_version;
        assembly.value.name = response.data.name;
        assembly.value.description = response.data.description;
        assembly.value.quantity = response.data.quantity;
        assembly.value.rework = response.data.rework;
        assembly.value.price = 0;
      });
    }

    function generate_assemblies() {
      api
        .post(`/api/assembly-job-generate/${active_id}/`)
        .then((response) => {});
    }

    function on_assembly_save() {
      assembly_edit_dialog.value = false;
    }

    function on_assembly_delete() {
      api.delete(`/api/assembly-job/${active_id}`).then((response) => {
        assembly_delete_dialog.value = false;
      });
    }

    function reserve_inventory_item_edit_dialog(row, value, initialValue) {
      const data = {
        quantity: value,
        inventory: row.id,
        assembly: row.assembly_item_id,
      };
      if (row.reservation.id) {
        // edit reservation
        if (data.quantity == 0) {
          api
            .delete(`/api/inventory-reservation/${row.reservation.id}`)
            .then((response) => {});
        } else {
          api
            .put(`/api/inventory-reservation/${row.reservation.id}/`, data)
            .then((response) => {});
        }
      } else {
        // create new reservation
        api.post(`/api/inventory-reservation/`, data).then((response) => {});
      }
      load_assembly_details();
    }

    function reload() {
      load_assembly_details();
      load_assembly_items();
    }

    function closeRework() {
      api
        .post(`/api/close-rework/${assembly.value.rework}/`)
        .then((response) => {
          reload();
        });
    }

    onMounted(() => {
      reload();
    });

    return {
      assembly_delete_dialog,

      assembly_edit_dialog,
      on_assembly_save,
      on_assembly_delete,

      reserve_inventory_item_edit_dialog,

      generate_assemblies,

      project,
      assembly,
      active_id,
      project_version,

      columns,
      items,

      quantity_unit_id_to_name,
      update_assembly_items_data,
      closeRework,
    };
  },
  components: {
    AssemblyEditCreateDialog,
    DeleteConfirmationDialog,
    AlternativeLocationTable,
  },
};
</script>
