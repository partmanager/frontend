<template>
  <q-select
    v-model="don"
    @before-show="load_initial_data"
    @filter="filter_don_select"
    @virtual-scroll="don_onScroll"
    :options="filtered_don_set"
    :loading="loading"
    option-label="don"
    option-value="id"
    use-input
    input-debounce="300"
    fill-input
    hide-selected
    filled
    class="col-3"
    label="Distributor Order Number"
    hint="Distributor specific order number"
  />
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "DistributorOrderNumberSelect",
  props: {
    distributor_id: {
      type: Number,
    },
  },
  setup(props) {
    const don = ref();
    const loading = ref();
    const filtered_don_set = ref(["loading..."]);
    const don_filter = ref(null);

    function don_onScroll({ to, ref }) {
      console.log({ to, ref });
      let props = {
        pagination: { rowsPerPage: 100, page: 1 },
        filter: don_filter.value,
      };
      request_distributor_order_numbers_list(props);
    }

    function load_initial_data() {
      console.log(`Loading initial data for ${props.distributor_id}`);
      if (props.distributor_id) {
        let props = {
          pagination: { rowsPerPage: 100, page: 1 },
          filter: don_filter.value,
        };
        request_distributor_order_numbers_list(props);
      } else {
        console.log("Missing distributor id");
      }
    }

    function request_distributor_order_numbers_list(table_props) {
      const { page, rowsPerPage } = table_props.pagination;
      const filter = table_props.filter;
      loading.value = true;
      api
        .get("api/distributor-order-number/", {
          params: {
            distributor: props.distributor_id,
            search: filter,
            pageSize: rowsPerPage,
            pageNumber: page,
          },
        })
        .then((response) => {
          filtered_don_set.value = response.data.results;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function filter_don_select(val, update, abort) {
      update((don_filter.value = val));
    }

    return {
      don,
      loading,
      filtered_don_set,

      load_initial_data,
      filter_don_select,
      don_onScroll,
    };
  },
});
</script>
