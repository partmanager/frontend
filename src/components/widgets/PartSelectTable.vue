<template>
  <q-table
    v-model:pagination="add_item_parts_pagination"
    v-model:selected="add_item_parts_selected"
    :rows="add_item_parts"
    :columns="[
      {
        name: 'manufacturer',
        label: 'Manufacturer',
        align: 'left',
        field: (row) => row.part.manufacturer.name,
      },
      {
        name: 'mon',
        label: 'Manufacturer Order Number',
        align: 'left',
        field: 'manufacturer_order_number',
      },
      {
        name: 'mpn',
        label: 'Manufacturer Part Number',
        align: 'left',
        field: (row) => row.part.manufacturer_part_number,
      },
      {
        name: 'description',
        label: 'Description',
        align: 'left',
        field: (row) => row.part.description,
      },
      {
        name: 'package',
        label: 'Package',
        align: 'left',
        field: (row) => row.part.package,
      },
      {
        name: 'packaging',
        label: 'Packaging',
        align: 'left',
        field: 'packaging_type',
      },
    ]"
    :loading="add_item_parts_loading"
    :filter="table_filter"
    selection="single"
    row-key="id"
    @request="onPartRequest"
    @update:selected="on_selection_changed"
    autogrow
  ></q-table>
</template>

<script>
import { ref, toRef, defineComponent, onMounted, onUpdated } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "PartSelectTable",
  props: {
    title: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: Object,
    },
    part_number: {
      type: String,
    },
    initial_part_id: {
      type: Number,
    },
    onSelectChange: {
      type: Function,
    },
  },
  methods: {
    emitVal(value) {
      if (value) {
        this.$emit("update:selected", value);
      }
      props.onSelectChange(value);
    },
  },
  setup(props) {
    const use_initial_part_id = ref(true);
    const add_item_parts = ref([]);
    const add_item_parts_selected = ref();
    const add_item_parts_loading = ref(false);
    const add_item_name = ref("Mur");
    const add_item_parts_pagination = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10,
    });
    const emitValtest = ref(props.onSelectChange);

    const table_filter = ref({
      manufacturer: toRef(props, "manufacturer"),
      part_number: toRef(props, "part_number"),
    });

    function on_selection_changed(selected) {
      if (selected.length == 0 && use_initial_part_id.value === true) {
        console.log("User deselected part, switching to part search mode");
        use_initial_part_id.value = false;
      }
      props.onSelectChange(selected);
    }

    function onPartRequest(propsss) {
      add_item_parts_loading.value = true;

      if (use_initial_part_id.value && props.initial_part_id) {
        api
          .get(`/api/part/mon/${props.initial_part_id}`, { params: params })
          .then((response) => {
            add_item_parts.value = [response.data];

            if (response.data.id == props.initial_part_id) {
              add_item_parts_selected.value = [response.data];
              emitValtest.value(add_item_parts_selected.value);
            } else {
              console.log("Error part id should be equal initial part id");
            }
          })
          .finally(() => {
            add_item_parts_loading.value = false;
          });
      } else {
        const { page, rowsPerPage } = propsss.pagination;
        var params = {
          search: table_filter.value.part_number,
          pageSize: rowsPerPage,
          pageNumber: page,
        };

        if (table_filter.value.manufacturer) {
          params["manufacturer"] = table_filter.value.manufacturer.id;
        }
        api
          .get(`/api/part/mon/`, { params: params })
          .then((response) => {
            add_item_parts_pagination.value.page = page;
            add_item_parts_pagination.value.rowsPerPage = rowsPerPage;
            add_item_parts_pagination.value.rowsNumber = response.data.count;
            add_item_parts.value = response.data.results;
          })
          .finally(() => {
            add_item_parts_loading.value = false;
          });
      }
    }

    onMounted(() => {
      const data = { pagination: add_item_parts_pagination.value };
      onPartRequest(data);
    });

    return {
      table_filter,

      props,

      add_item_parts,
      add_item_parts_selected,
      add_item_parts_loading,
      add_item_name,
      add_item_parts_pagination,

      onPartRequest,
      emitValtest,
      on_selection_changed,
    };
  },
});
</script>
