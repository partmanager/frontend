<template>
  <q-page
    class="window-height window-width row justify-center bg-image"
  >
    <div class="column">
      <div class="row">
        <h5 class="text-h6 text-black text-center full-width">Sign In</h5>
      </div>
      <div class="row">
        <q-card square class="q-pa-lg shadow-0" style="background:none;">
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                square
                filled
                clearable
                v-model="email"
                type="email"
                label="Email"
                label-color="white"
                bg-color="field"
              >
              <template v-slot:prepend>
                <q-icon name="email" color="white" />
              </template>
              </q-input>
              <q-input
                square
                filled
                clearable
                v-model="password"
                type="password"
                label="Password"
                label-color="white"
                bg-color="field"
              >
               <template v-slot:prepend>
                <q-icon name="lock" color="white"/>
              </template>
        </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              unelevated
              color="light-blue-7"
              size="lg"
              class="full-width"
              label="Sign In"
            />
          </q-card-actions>

        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SignIn',
  data () {
    return {
      email: '',
      password: ''
    }
  }
}
</script>

<style>
.q-card {
  width: 22.5rem;
}
.bg-image {
  /* background-image: url('../assets/food.jpg'); */
  background-size: cover;
}
.bg-field {
  background: rgba(0,0,0,0.5) !important;
}
</style>
