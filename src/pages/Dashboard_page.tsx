import Dashboard from "../components/Dashboard";
import LeadsTable from "../components/LeadsTable";

import type { Lead, LeadStatus } from "../types";

type DashboardPageProps = {
  leads: Lead[];
  loading: boolean;
  onStatusChange: (
    leadId: string,
    status: LeadStatus
  ) => Promise<void>;
};

export default function DashboardPage({
  leads,
  loading,
  onStatusChange,
}: DashboardPageProps) {
  return (
    <>
      <Dashboard leads={leads} />

      <LeadsTable
        leads={leads}
        loading={loading}
        onStatusChange={onStatusChange}
      />
    </>
  );
}