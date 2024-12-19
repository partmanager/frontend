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
          @click="assembly_edit_dialog = true"
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
    <q-table
      title="Parts"
      :columns="[
        {
          name: 'quantity',
          label: 'Quantity',
          field: 'quantity',
          sortable: true,
        },
        {
          name: 'reserved_qty',
          label: 'Reserved Quantity',
          field: 'reserved_qty',
        },
        {
          name: 'price',
          label: 'Parts price',
          field: 'price',
          sortable: true,
        },
        { name: 'action', label: 'Action', align: 'left', field: 'id' },
        {
          name: 'manufacturer',
          label: 'Manufacturer',
          field: 'part',
          format: (val, row) => {
            if (val) {
              return val.manufacturer;
            } else if (row.part_not_found_fallback) {
              return row.part_not_found_fallback.manufacturer;
            }
          },
        },
        {
          name: 'mpn',
          label: 'MPN',
          field: 'part',
          format: (val, row) => {
            if (val) {
              return val.manufacturer_part_number;
            } else if (row.part_not_found_fallback) {
              return row.part_not_found_fallback.MPN;
            }
          },
        },
        {
          name: 'mon',
          label: 'MON',
          field: 'manufacturer_order_number',
          format: (val, row) => {
            if (val) {
              return val.manufacturer_order_number;
            } else if (row.part_not_found_fallback) {
              return row.part_not_found_fallback.MON;
            }
          },
        },
        {
          name: 'desc',
          label: 'Description',
          field: 'part',
          format: (val, row) => {
            if (val) {
              return val.description;
            }
          },
        },
      ]"
      :rows="items"
      :wrap-cells="true"
    >
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
            <!-- Part sources table -->
            <q-table
              title="Parts sources"
              dense
              :columns="[
                {
                  name: 'location_name',
                  label: 'Name',
                  field: 'name',
                },
                {
                  name: 'available_qty',
                  label: 'Available quantity',
                  field: 'stock',
                },
                {
                  name: 'reserved_quantity',
                  label: 'Reserved Quantity',
                  field: 'reservation',
                  format: (val, row) => {
                    if (val) {
                      return val.quantity;
                    }
                  },
                },
                {
                  name: 'condition',
                  label: 'Condition',
                  field: 'condition',
                },
                {
                  name: 'status',
                  label: 'Status',
                  field: 'status',
                },
                {
                  name: 'unit_price',
                  label: 'Price',
                  field: 'invoice',
                  format: (val, row) => {
                    if (val) {
                      return val.unit_price + ' ' + val.price_currency;
                    }
                  },
                },
                {
                  name: 'bom_name',
                  label: 'Location',
                  field: 'storage_location',
                  format: (val, row) => {
                    if (val) {
                      return val.location;
                    }
                  },
                },
              ]"
              :rows="props.row.inventory_positions"
            >
              <template v-slot:body-cell-reserved_quantity="props">
                <q-td :props="props">
                  {{ props.value }}
                  <q-popup-edit
                    v-model="props.row.reservation.quantity"
                    buttons
                    v-slot="scope"
                    auto-save
                    @save="
                      (value, initialValue) => {
                        reserve_inventory_item_edit_dialog(
                          props.row,
                          value,
                          initialValue
                        );
                      }
                    "
                  >
                    <q-input
                      type="number"
                      v-model.number="scope.value"
                      dense
                      autofocus
                      @keyup.enter="scope.set"
                    />
                  </q-popup-edit>
                </q-td>
              </template>
              <template v-slot:body-cell-bom_name="props">
                <q-td :props="props">
                  <div>
                    <a :href="'#/bom/' + props.row.bom_id">
                      {{ props.value }}</a
                    >
                  </div>
                </q-td>
              </template></q-table
            >
            <br />
            <!-- Parts origins table-->
            <q-table
              title="Parts origin"
              dense
              :columns="[
                {
                  name: 'totalQty',
                  label: 'Project quantity',
                  field: 'project_qty',
                },
                {
                  name: 'bom_quantity',
                  label: 'BOM Quantity',
                  field: 'bom_qty',
                },
                { name: 'bom_name', label: 'BOM', field: 'name' },
                {
                  name: 'bom_designators',
                  label: 'Designators',
                  field: 'designators',
                },
              ]"
              :rows="
                Object.entries(props.row.item_origins).map(([id, values]) => ({
                  id,
                  ...values,
                }))
              "
            >
              <template v-slot:body-cell-bom_name="props">
                <q-td :props="props">
                  <div>
                    <a :href="'#/bom/' + props.row.bom_id">
                      {{ props.value }}</a
                    >
                  </div>
                </q-td>
              </template></q-table
            >
            <br />
            <q-separator />
            <div class="text-left">
              Assembly item ID: {{ props.row.id }}, Part ID:
              {{ props.row.part }}
            </div>
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

    function load_assembly_details() {
      api.get(`/api/assembly-job/${active_id}`).then((response) => {
        project.value = response.data.project_version.project;
        project_version.value = response.data.project_version;
        assembly.value.name = response.data.name;
        assembly.value.description = response.data.description;
        assembly.value.quantity = response.data.quantity;
        assembly.value.price = 0;

        // items.value = response.data.assembly_item_set;

        for (let index = 0; index < items.value.length; ++index) {
          items.value[index].reserved_qty = 0;
          items.value[index].price = 0;
          items.value[index].available_qty = 0;

          if (items.value[index].inventory_positions_set) {
            let inventory_positions =
              items.value[index].inventory_positions_set;
            // items.value[index].manufacturer_order_number
            //   .inventoryposition_set;
            const inventory_reservation_set =
              items.value[index].inventoryreservation_set;

            for (let ip = 0; ip < inventory_positions.length; ++ip) {
              inventory_positions[ip].assembly_item_id = items.value[index].id;
              inventory_positions[ip].popup = ref();
              inventory_positions[ip].reservation = { quantity: 0 };
              items.value[index].available_qty += inventory_positions[ip].stock;

              for (let ir = 0; ir < inventory_reservation_set.length; ++ir) {
                if (
                  inventory_positions[ip].id ==
                  inventory_reservation_set[ir].inventory
                ) {
                  items.value[index].reserved_qty +=
                    inventory_reservation_set[ir].quantity;

                  inventory_positions[ip].reservation =
                    inventory_reservation_set[ir];

                  if (inventory_positions[ip].invoice) {
                    items.value[index].price +=
                      inventory_reservation_set[ir].quantity *
                      inventory_positions[ip].invoice.unit_price;
                  }
                }
              }
            }
            assembly.value.price += items.value[index].price;
            items.value[index].inventory_positions = inventory_positions;
          } else {
            items.value[index].inventory_positions = [];
          }
        }
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

    onMounted(() => {
      load_assembly_details();
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

      items,

      quantity_unit_id_to_name,
    };
  },
  components: {
    AssemblyEditCreateDialog,
    DeleteConfirmationDialog,
  },
};
</script>
