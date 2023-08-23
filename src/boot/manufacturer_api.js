import { api } from "./axios";
import { ref } from "vue";

const manufacturer_set = ref();

function load_manufacturers() {
  api.get("api/manufacturer").then((response) => {
    manufacturer_set.value = response.data;
  });
}

function get_manufacturer_set() {
  if (!manufacturer_set.value) {
    load_manufacturers();
  }
  return manufacturer_set;
}

function get_manufacturer_by_id(id) {
  const manufacturer_set = get_manufacturer_set();
  const found = manufacturer_set.value.filter((v) => v.id == id);
  if (found) {
    return found[0];
  }
  return null;
}

export { get_manufacturer_set, get_manufacturer_by_id };
