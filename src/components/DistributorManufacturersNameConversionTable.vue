<template>
  <div>
    <q-table
      :rows="rows"
      :columns="[
        {
          name: 'distributor_manufacturer_name',
          label: 'Distributor specific manufacturer name',
          align: 'left',
          field: 'manufacturer_name_text',
        },
        {
          name: 'manufacturer_name',
          label: 'Manufacturer Name',
          align: 'left',
          field: 'manufacturer_name',
        },
        {
          name: 'manufacturer_full_name',
          label: 'Manufacturer Full Name',
          align: 'left',
          field: 'manufacturer_full_name',
        },
        {
          name: 'manufacturer_id',
          label: 'Manufacturer ID',
          align: 'left',
          field: 'id',
        },
        {
          name: 'action',
          label: 'Action',
          align: 'left',
          field: 'id',
        },
      ]"
      :loading="loading"
    >
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div>
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="show_manufacturer_conversion_dialog(props.row.id)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete"
              @click="
                show_delete_confirmation_dialog(
                  props.row.id,
                  props.row.manufacturer_name_text
                )
              "
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <DistributorManufacturerNameConversionEditCreateDialog
      v-model="manufacturer_conversion_dialog_model"
      :edit_id="id_to_edit"
      :onsave="on_manufacturer_conversion_dialog_save"
    >
    </DistributorManufacturerNameConversionEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="delete_dialog"
      :title="'Delete manufacturer name conversion from Distributor'"
      :ondelete="onManufacturerNameConversionDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ manufacturer_name }}</strong> manufacturer name convesion
        from <strong>{{ distributor_name }}</strong
        >?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import { delete_manufacturer_name_conversion } from "src/boot/distributor_set";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog.vue";
import DistributorManufacturerNameConversionEditCreateDialog from "./DistributorManufacturerNameConversionEditCreateDialog.vue";

const delete_dialog = ref();

export default defineComponent({
  name: "DistributorManufacturerNameConversionTable",
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    distributor_name: {
      type: String,
      required: true,
    },
    rows: {
      type: Array,
    },
  },
  setup(props) {
    const manufacturer_name = ref();
    const manufacturer_conversion_dialog_model = ref();
    const id_to_edit = ref();
    const id_to_delete = ref();

    function show_manufacturer_conversion_dialog(id) {
      id_to_edit.value = id;
      manufacturer_conversion_dialog_model.value = true;
    }

    function on_manufacturer_conversion_dialog_save() {
      manufacturer_conversion_dialog_model.value = false;
    }

    function show_delete_confirmation_dialog(id, name) {
      id_to_delete.value = id;
      manufacturer_name.value = name;
      delete_dialog.value = true;
    }

    function onManufacturerNameConversionDelete() {
      delete_manufacturer_name_conversion(id_to_delete.value);
      delete_dialog.value = false;
    }

    return {
      delete_dialog,
      id_to_edit,
      manufacturer_name,
      manufacturer_conversion_dialog_model,
      show_manufacturer_conversion_dialog,
      on_manufacturer_conversion_dialog_save,
      show_delete_confirmation_dialog,
      onManufacturerNameConversionDelete,
    };
  },
  components: {
    DeleteConfirmationDialog,
    DistributorManufacturerNameConversionEditCreateDialog,
  },
});
</script>
