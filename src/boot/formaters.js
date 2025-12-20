import { quantity_dict, currency_dict } from "boot/choices.js";

const condition = {
  n: "New",
  u: "Used",
  r: "Refurbished",
  b: "Broken",
  k: "Unknown",
};

const bookkeping_dict = {
  k: "Track in bookkeeping",
  m: "Track as material",
  s: "Track as service",
  e: "Track as equipment",
  p: "Private use, don't track",
};

const paymentMethodDict = {
  1: "Bank Transfer",
  2: "Cash",
  3: "Credit card",
  4: "PayPal",
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

function format_currency(value, currency, decimals = 2) {
  if (currency in currency_dict) {
    return parseFloat(value).toFixed(decimals) + " " + currency_dict[currency];
  } else {
    return parseFloat(value).toFixed(decimals) + " Error, Unknown currency";
  }
}

function format_bookkeeping(bookkeeping) {
  if (bookkeeping && bookkeeping in bookkeping_dict) {
    return bookkeping_dict[bookkeeping];
  } else {
    console.log("Error, unknown bookkeeping");
    return "Error, Unknown bookkeeping";
  }
}

function format_paymentMethod(paymentMethod) {
  if (paymentMethod && paymentMethod in paymentMethodDict) {
    return paymentMethodDict[paymentMethod];
  } else {
    console.log("Error, unknown payment method");
    return "Error, Unknown payment method";
  }
}

export {
  format_condition,
  format_quantity,
  format_currency,
  format_bookkeeping,
  format_paymentMethod,
};
