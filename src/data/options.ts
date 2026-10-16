import type { LeadFormData, LeadStatus } from "../types";

export const statuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Converted",
  "Lost",
];

export const products = [
  "PuREPower Home 3kWh",
  "PuREPower Home 5kWh",
  "PuREPower Commercial 10kWh",
];

export const sources = [
  "Website",
  "Voice Agent",
  "WhatsApp",
  "Dealer Walk-in",
];

export const emptyForm: LeadFormData = {
  name: "",
  mobile: "",
  pincode: "",
  product: products[0],
  source: sources[0],
};