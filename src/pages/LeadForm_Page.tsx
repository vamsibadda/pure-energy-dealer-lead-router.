import LeadForm from "../components/LeadForm";
import type { LeadFormData } from "../types";

type LeadFormPageProps = {
  onCreateLead: (form: LeadFormData) => Promise<void>;
  saving: boolean;
};

export default function LeadFormPage({
  onCreateLead,
  saving,
}: LeadFormPageProps) {
  return (
    <LeadForm
      onCreateLead={onCreateLead}
      saving={saving}
    />
  );
}