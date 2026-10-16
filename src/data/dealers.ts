import type { Dealer } from "../types";

export const dealers: Dealer[] = [
  {
    dealer_id: "D01",
    dealer_name: "Sri Sai Power Solutions",
    city: "Hyderabad",
    pincode_prefixes: ["500"],
    contact_email: "d01@example.com",
  },
  {
    dealer_id: "D02",
    dealer_name: "Kandi Energy Point",
    city: "Sangareddy",
    pincode_prefixes: ["502"],
    contact_email: "d02@example.com",
  },
  {
    dealer_id: "D03",
    dealer_name: "Warangal Green Systems",
    city: "Warangal",
    pincode_prefixes: ["506"],
    contact_email: "d03@example.com",
  },
  {
    dealer_id: "D04",
    dealer_name: "Karimnagar Solar Hub",
    city: "Karimnagar",
    pincode_prefixes: ["505"],
    contact_email: "d04@example.com",
  },
  {
    dealer_id: "D05",
    dealer_name: "Vizag Home Power",
    city: "Visakhapatnam",
    pincode_prefixes: ["530", "531"],
    contact_email: "d05@example.com",
  },
  {
    dealer_id: "D06",
    dealer_name: "Krishna Energy Store",
    city: "Vijayawada",
    pincode_prefixes: ["520", "521"],
    contact_email: "d06@example.com",
  },
  {
    dealer_id: "D07",
    dealer_name: "Guntur Battery World",
    city: "Guntur",
    pincode_prefixes: ["522"],
    contact_email: "d07@example.com",
  },
  {
    dealer_id: "D08",
    dealer_name: "Tirupati PowerHouse",
    city: "Tirupati",
    pincode_prefixes: ["517"],
    contact_email: "d08@example.com",
  },
];

export function findDealer(
  pincode: string
): Dealer | undefined {
  const prefix = pincode.substring(0, 3);

  return dealers.find(function (dealer) {
    return dealer.pincode_prefixes.includes(prefix);
  });
}