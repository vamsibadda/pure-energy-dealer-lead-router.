import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/Header";
import AlertMessage from "./components/AlertMessage";

import LeadFormPage from "./pages/LeadForm_Page";
import DashboardPage from "./pages/Dashboard_page";

import { useLeads } from "./hooks/useLeads";

import {
  createLead,
  updateLeadStatus,
} from "./services/lead_service";

import type { LeadFormData, LeadStatus } from "./types";

export default function App() {
  const { leads, loading, error: loadingError } = useLeads();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreateLead(form: LeadFormData) {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await createLead(form);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    leadId: string,
    status: LeadStatus
  ) {
    setError("");
    setSuccess("");

    try {
      await updateLeadStatus(leadId, status);
      setSuccess("Lead status updated successfully.");
    } catch (statusError) {
      console.error(statusError);

      setError(
        "Could not update status. Check Firestore security rules."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AlertMessage
          message={error || loadingError}
          type="error"
        />

        <AlertMessage
          message={success}
          type="success"
        />

        <Routes>
          <Route
            path="/"
            element={
              <LeadFormPage
                onCreateLead={handleCreateLead}
                saving={saving}
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <DashboardPage
                leads={leads}
                loading={loading}
                onStatusChange={handleStatusChange}
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
        PURE Energy · Dealer Lead Router · React, TypeScript and Firebase
      </footer>
    </div>
  );
}