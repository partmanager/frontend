<template>
    <q-dialog
      @before-show="item_history_load_data"
    >
        <q-card style="width: 700px; max-width: 80vw;"> 
            <q-card-section>
                <div class="text-h6">Inventory history</div>
            </q-card-section>

            <q-separator />

            <q-card-section style="max-height: 60vh" class="scroll">
                <q-table                  
                  :rows="rows"
                  :columns="[ { name: 'version', label: 'Version', align: 'left', field: 'version'},
                              { name: 'date', label: 'Date', align: 'left', field: 'date'},
                              { name: 'user', label: 'User', align: 'left', field: 'user'},
                              { name: 'stock', label: 'Stock', align: 'left', field: 'stock'},
                              { name: 'storage_location', label: 'Storage Location', align: 'left', field: 'storage_location'},
                              { name: 'comment', label: 'Comment', align: 'left', field: 'comment'}]"            
                  :loading="loading"
                >
                </q-table>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">          
               <q-btn flat label="Close" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
    name: 'InventoryHistory',
    props: {
        id: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const loading = ref(false)
        const rows = ref([])
        const last_loaded_id = ref()        

        function onItemHistoryRequest(id) {            
            rows.value = []
            loading.value = true;
            
            api.get(`/inventory/history/${id}`)
                .then(response => {
                    last_loaded_id.value = id
                    rows.value = response.data.rows;
                })
                .finally(() => {
                    loading.value = false;
                });
            
        }

        function item_history_load_data() {
            onItemHistoryRequest(props.id);           
        }

        return {            
            loading,
            rows,
            item_history_load_data
        }
    }
})
</script>
