<template>
  <q-card flat bordered>
    <q-card-actions>
      Filters
      <q-space />

      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-card-section class="row q-gutter-md">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2">Distributor Filter</div>
            </q-card-section>

            <q-separator inset />

            <q-card-section>
              <DistributorSelect
                v-model="distributor"
                multiple
                use-chips
              ></DistributorSelect>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section>
              <q-checkbox v-model="paid" label="Paid" toggle-indeterminate />
              <q-checkbox
                v-model="privateUse"
                label="Private use"
                toggle-indeterminate
              />
            </q-card-section>
          </q-card>

          <DateRangeCard
            title="Invoice Date Filter"
            @date-range="onInvoiceDateFilterChange"
          >
          </DateRangeCard>

          <DateRangeCard
            v-model="dueDate"
            title="Due date filter"
            @date-range="onDueDateFilterChange"
          >
          </DateRangeCard>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import { ref, defineComponent, watch } from "vue";
import DistributorSelect from "./DistributorSelect.vue";
import DateRangeCard from "./DateRangeCard.vue";

export default defineComponent({
  name: "InvoicesFiltersCard",
  components: { DistributorSelect, DateRangeCard },
  props: {},
  emits: ["on_change"],
  setup(props, { emit }) {
    const expanded = ref(false);
    const distributor = ref(null);
    const paid = ref(null);
    const privateUse = ref(null);
    const invoiceDate = ref();
    const dueDate = ref();

    function onInvoiceDateFilterChange(value) {
      invoiceDate.value = value;
      emit_data();
    }

    function onDueDateFilterChange(value) {
      dueDate.value = value;
      emit_data();
    }

    function emit_data() {
      let filters = {
        paid: paid.value,
        privateUse: privateUse.value,
      };

      if (distributor.value) {
        filters.distributor = distributor.value.map((x) => x.id);
      }

      if (invoiceDate.value && invoiceDate.value.from)
        filters.invoiceDate_from = new Date(invoiceDate.value.from);
      if (invoiceDate.value && invoiceDate.value.to)
        filters.invoiceDate_to = new Date(invoiceDate.value.to);

      if (dueDate.value) {
        filters.dueDate = { from: null, to: null };
        if (dueDate.value.from)
          filters.dueDate.from = new Date(dueDate.value.from);
        if (dueDate.value.to) filters.dueDate.to = new Date(dueDate.value.to);
      }

      console.log(filters);
      emit("on_change", filters);
    }

    watch(
      () => distributor.value,
      (current, previous) => {
        emit_data();
      }
    );

    watch(
      () => paid.value,
      (current, previous) => {
        emit_data();
      }
    );

    watch(
      () => privateUse.value,
      (current, previous) => {
        emit_data();
      }
    );

    return {
      expanded,
      distributor,
      paid,
      privateUse,
      dueDate,

      onInvoiceDateFilterChange,
      onDueDateFilterChange,
    };
  },
});
</script>
