
import {
  collection,
  doc,
  getDocs,
  runTransaction,
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

  // Step 1: Check for duplicate mobile numbers.
  try {
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
  } catch (error) {
    console.error(
      "Step 1 - Duplicate mobile check failed:",
      error
    );
    throw error;
  }

  // Step 2: Assign a dealer based on the PIN code.
  const dealer = findDealer(pincode);

  const dealerId = dealer?.dealer_id ?? "INHOUSE";
  const dealerName =
    dealer?.dealer_name ?? "In-house Sales";

  // Step 3: Generate the sequential ID and create the lead.
  try {
    const counterRef = doc(db, "counters", "leads");

    const nextLeadId = await runTransaction(
      db,
      async function (transaction) {
        const counterSnapshot =
          await transaction.get(counterRef);

        const lastNumber = counterSnapshot.exists()
          ? Number(counterSnapshot.data().lastNumber ?? 0)
          : 0;

        const nextNumber = lastNumber + 1;
        const leadId = `L${nextNumber}`;

        const leadRef = doc(db, "leads", leadId);

        transaction.set(counterRef, {
          lastNumber: nextNumber,
        });

        transaction.set(leadRef, {
          lead_id: leadId,
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

        return leadId;
      }
    );

    console.log("Lead created successfully:", nextLeadId);

    return dealerName;
  } catch (error) {
    console.error(
      "Step 2 - Lead creation transaction failed:",
      error
    );
    throw error;
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
) {
  try {
    await updateDoc(doc(db, "leads", leadId), {
      status: status,
    });
  } catch (error) {
    console.error("Lead status update failed:", error);
    throw error;
  }
}
