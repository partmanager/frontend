<template>
    <q-table                  
        :rows="rows"
        :columns="[ { name: 'series_name', label: 'Series', align: 'left', field: 'series'},
                    { name: 'series_description', label: 'Description', align: 'left', field: 'series_description'},
                    { name: 'part_type', label: 'Part Type', align: 'left', field: 'part_type'},
                    { name: 'part_count', label: 'Part count', align: 'left', field: 'partCount'},
                    { name: 'mon_count', label: 'Order numbers count', align: 'left', field: 'orderNumberCount'}]"                    
        :loading="loading"
    >        
    </q-table>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ManufacturerPartSeriesTable',
  props: {
    loading: {
      type: Boolean,
      required: true
    },

    rows: {
      type: Array      
    }
  }
})
</script>
