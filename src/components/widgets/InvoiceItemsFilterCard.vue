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

      <q-btn dense @click="emit_data" />
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
                dense
              ></DistributorSelect>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section>
              <div class="text-subtitle2">Bookkeeping Filter</div>
            </q-card-section>

            <q-separator inset />
            <q-card-section>
              <BookkeepingTypeWidget
                v-model="bookkeeping"
                filled
                multiple
                use-chips
                dense
              ></BookkeepingTypeWidget>
            </q-card-section>
          </q-card>

          <DateRangeCard
            title="Invoice Date Filter"
            @date-range="onInvoiceDateFilterChange"
          >
          </DateRangeCard>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import { ref, defineComponent } from "vue";
import DistributorSelect from "components/widgets/DistributorSelect.vue";
import BookkeepingTypeWidget from "components/widgets/BookkeepingTypeWidget.vue";
import DateRangeCard from "components/widgets/DateRangeCard.vue";

export default defineComponent({
  name: "InvoiceItemsFilterCard",
  components: { DistributorSelect, BookkeepingTypeWidget, DateRangeCard },
  props: {},
  emits: ["on_change"],
  setup(props, { emit }) {
    const expanded = ref(false);
    const distributor = ref();
    const bookkeeping = ref();
    const invoiceDate = ref();

    function onInvoiceDateFilterChange(value) {
      invoiceDate.value = value;
      emit_data();
    }

    function emit_data() {
      let filters = {
        //     paid: paid.value,
        // privateUse: privateUse.value,
      };

      if (distributor.value) {
        filters.distributor = distributor.value.map((x) => x.id);
      }

      if (invoiceDate.value && invoiceDate.value.from)
        filters.invoiceDate_from = new Date(invoiceDate.value.from);
      if (invoiceDate.value && invoiceDate.value.to)
        filters.invoiceDate_to = new Date(invoiceDate.value.to);

      console.log(filters);
      emit("on_change", filters);
    }

    return {
      expanded,

      distributor,
      bookkeeping,
      invoiceDate,

      onInvoiceDateFilterChange,
      emit_data,
    };
  },
});
</script>
