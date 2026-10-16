import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { findDealer } from "../data/dealers";
import type { LeadFormData, LeadStatus } from "../types";

export async function createLead(form: LeadFormData) {
  const mobile = form.mobile.trim();
  const name = form.name.trim();
  const pincode = form.pincode.trim();

  const duplicateQuery = query(
    collection(db, "leads"),
    where("mobile", "==", mobile)
  );

  const duplicateSnapshot = await getDocs(duplicateQuery);

  if (!duplicateSnapshot.empty) {
    throw new Error(
      "A lead with this mobile number already exists."
    );
  }

  const dealer = findDealer(pincode);

  const dealerId = dealer?.dealer_id ?? "INHOUSE";
  const dealerName =
    dealer?.dealer_name ?? "In-house Sales";

  await addDoc(collection(db, "leads"), {
    name: name,
    mobile: mobile,
    pincode: pincode,
    product: form.product,
    source: form.source,
    dealerId: dealerId,
    dealerName: dealerName,
    status: "New",
    createdAt: serverTimestamp(),
  });

  return dealerName;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
) {
  await updateDoc(doc(db, "leads", leadId), {
    status: status,
  });
}