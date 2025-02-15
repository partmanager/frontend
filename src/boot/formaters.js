import { quantity_dict, currency_dict } from "boot/choices.js";

const condition = {
  n: "New",
  u: "Used",
  r: "Refurbished",
  b: "Broken",
  k: "Unknown",
};

function format_condition(cond) {
  if (cond in condition) {
    return condition[cond];
  } else {
    console.log("Error unknown condition");
    return "ERROR, Unknown Condition";
  }
}

function format_quantity(quantity, unit) {
  if (unit in quantity_dict) return quantity + " " + quantity_dict[unit];
  else {
    console.log("Error, unknown quantity");
    return "Error, Unknown quantity";
  }
}

function format_currency(value, currency) {
  if (currency in currency_dict) {
    return parseFloat(value).toFixed(2) + " " + currency_dict[currency];
  } else {
    return parseFloat(value).toFixed(2) + " Error, Unknown currency";
  }
}

export { format_condition, format_quantity, format_currency };
