import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db, initializeAuthentication } from "../firebase";
import type { Lead } from "../types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function loadLeads() {
      try {
        await initializeAuthentication();

        if (cancelled) {
          return;
        }

        unsubscribe = onSnapshot(
          collection(db, "leads"),
          function (snapshot) {
            const records: Lead[] = snapshot.docs.map(
              function (item) {
                return {
                  id: item.id,
                  ...(item.data() as Omit<Lead, "id">),
                };
              }
            );

            setLeads(records);
            setLoading(false);
            setError("");
          },
          function (firebaseError) {
            console.error(firebaseError);
            setError(
              "Could not load leads. Check Firestore security rules."
            );
            setLoading(false);
          }
        );
      } catch (firebaseError) {
        console.error(firebaseError);
        setError(
          "Firebase sign-in failed. Check your configuration and Anonymous Authentication."
        );
        setLoading(false);
      }
    }

    void loadLeads();

    return function () {
      cancelled = true;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    leads,
    loading,
    error,
  };
}