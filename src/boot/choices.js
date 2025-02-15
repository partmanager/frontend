const quantity_unit_set = [
  { label: "pcs", value: 1 },
  { label: "kg", value: 2 },
  { label: "m", value: 3 },
];

const quantity_dict = {
  1: "pcs",
  2: "kg",
  3: "m",
};

const currency_set = [
  { label: "PLN", value: 3 },
  { label: "USD", value: 2 },
  { label: "EUR", value: 1 },
];

const currency_dict = {
  3: "PLN",
  2: "USD",
  1: "EUR",
};

function get_quantity_unit_by_id(id) {
  const found = quantity_unit_set.filter((v) => v.value == id);
  if (found) {
    return found[0];
  }
  return null;
}

function get_currency_by_id(id) {
  const found = currency_set.filter((v) => v.value == id);
  if (found) {
    return found[0];
  }
  return null;
}

function quantity_unit_id_to_name(id) {
  const found = get_quantity_unit_by_id(id);
  if (found) {
    return found.label;
  }
  return null;
}

export {
  quantity_unit_set,
  quantity_dict,
  currency_set,
  currency_dict,
  get_quantity_unit_by_id,
  get_currency_by_id,
  quantity_unit_id_to_name,
};
