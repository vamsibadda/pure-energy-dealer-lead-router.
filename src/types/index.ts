export type LeadStatus =
  | "New"
  | "Contacted"
  | "Converted"
  | "Lost";

export type Lead = {
  id: string;
  name: string;
  mobile: string;
  pincode: string;
  product: string;
  source: string;
  dealerId: string;
  dealerName: string;
  status: LeadStatus;
  createdAt?: unknown;
};

export type Dealer = {
  dealer_id: string;
  dealer_name: string;
  city: string;
  pincode_prefixes: string[];
  contact_email: string;
};

export type LeadFormData = {
  name: string;
  mobile: string;
  pincode: string;
  product: string;
  source: string;
};