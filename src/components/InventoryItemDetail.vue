<template>
    <br />  
            <div class="text-h4">{{ row.manufacturer }} {{row.part}}</div>
            <br />
            <q-separator />
            <br />
            Description:<br />            
            <div class="text-h5">{{ row.description }}</div><br/>
            Location:<br>
            <strong>{{ row.storage_location }}</strong> -> {{ row.stock }} {{ row.stock_unit }}<br>
            Condition: {{ row.condition }}<br>
            Status: {{ row.state }}<br />
            <div class="q-pa-md" style="max-width: 1000px">
              <form @submit.prevent.stop="onSubmit" class="q-gutter-y-md">
                <q-input
                 
                  filled dense
                  type="number"                    
                  label="Quantity"                    
                />
                <q-input
               
                  filled dense
                  type="text"                    
                  label="Comment" 
                />
                <q-btn label="Update" type="submit" color="primary" @click="update_item_stock(row.id, row.updated_quantity, row.stock, row.comment)"/>
              </form>
            </div>
            
            <q-img v-if="row.image !== null && !row.image.endsWith='None'"
              :src="row.image"
              style="height: 100px; width: 100px"
            />

            <q-input
        
              filled
              readonly
              type="textarea"              
            />
            

            <div v-if="row.invoice_number != Null">
              <br />
              <q-separator />
              <br />
              <q-table
                title="Invoice information" 
                hide-bottom           
                :columns="[{ name: 'distributor', label: 'Distributor', align: 'left', field: 'distributor'},
                          { name: 'invoice', label: 'Invoice', align: 'left', field: 'invoice_number'},
                          { name: 'shipped_quantity', label: 'Shipped quantity', align: 'left', field: 'shipped_quantity'},
                          { name: 'price', label: 'Unit Price', align: 'left', field: 'price'},
                          { name: 'stock_value', label: 'Stock value', align: 'left', field: 'stock_value'}]"
                :rows="[row]"
                >
              </q-table>              
            </div>

            <div v-if="row.alternative_locations != Null && row.alternative_locations.length > 0">
              <br />
              <q-separator />
              <br />
              <q-table    
                hide-bottom           
                :columns="[{ name: 'distributor', label: 'Distributor', align: 'left', field: 'distributor'},
                          { name: 'invoice', label: 'Invoice', align: 'left', field: 'invoice_number'},
                          { name: 'shipped_quantity', label: 'Shipped quantity', align: 'left', field: 'shipped_quantity'},
                          { name: 'stock_quantity', label: 'Stock quantity', align: 'left', field: 'stock_quantity'},
                          { name: 'storage_location', label: 'Storage location', align: 'left', field: 'storage_location'},
                          { name: 'condition', label: 'Condition', align: 'left', field: 'condition'},
                          { name: 'price', label: 'Unit Price', align: 'left', field: 'price'},
                          { name: 'stock_value', label: 'Stock value', align: 'left', field: 'stock_value'}]"
                :rows="[row.alternative_locations]"
                >                
              </q-table>              
            </div>
            
            <div v-if="row.distributor_pk_set_urlencoded != Null">   
              <br />
              <q-separator />
              <br />
              
              <q-table
                title="Distributors data"      
                dense                
                :columns="distributor_data_columns"
                :rows="distributors_data_rows"
                row-key="id"                
              >
                <template v-slot:top-right>
                  <q-btn color="secondary" :disable="loading" label="Refresh Distributor Data" @click="onDistributorDataRequest(row.distributor_pk_set_urlencoded)" />                       
                </template>

                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width />
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn size="sm" color="secondary" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
                    </q-td>
                    <q-td
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >   <div v-if="col.name!='distributor' && col.name!='distributor_order_number'">
                          {{ col.value }}
                        </div>
                        <a :href="col.value.url" v-if="col.name='distributor'">{{col.value.name}}</a> 
                        <a :href="col.value.url" v-if="col.name='distributor_order_number'">{{col.value.don}}</a> 
                    </q-td>
                  </q-tr>
                  <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%">  
                      <q-table    
                        hide-bottom           
                        :columns="[{ name: 'amount', label: 'Order Quantity', align: 'left', field: 'amount'},
                                  { name: 'unitPrice', label: 'Price per unit', align: 'left', format: (val, row) => `${val} ${row.currency}`, field: 'price'},
                                  { name: 'vatRate', label: 'VAT', align: 'left', format: val => `${val}%`, field: 'vatRate'},
                                  { name: 'priceType', label: 'Price Type', align: 'left', field: 'priceType'}
                                  ]"                       
                        :rows="row.prices"
                        >
                      </q-table>  
                    </q-td>
                  </q-tr>                    
                </template>
              </q-table>
            </div>

            <br />
            <q-separator />
            <div class="text-left">Inventory ID: {{ row.id }}, Part ID: {{ row.part_pk}}</div>
</template>


<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InventoryItemDetail',
  props: {
    row: {
      type: Object      
    }    
  }
})
</script>