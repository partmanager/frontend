<template>
    <q-dialog>
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section>
                <div class="text-h6">{{title}}</div>
            </q-card-section>
            <q-separator />
        
            <q-card-section>
                Are you sure you want to delete <strong>{{ manufacturer_name }}</strong> manufacturer?
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn flat label="Delete" color="red" type="submit" />                            
            </q-card-actions>
            
        </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ManufacturerDeleteConfirmationDialog',
  props: {
    title: {
      type: String,
      required: true
    },

    manufacturer_name: {
      type: String,      
      required: true
    }
  }
})
</script>