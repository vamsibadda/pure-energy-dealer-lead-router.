import { useMemo, useState } from "react";

import { dealers } from "../data/dealers";
import { statuses } from "../data/options";
import type { Lead, LeadStatus } from "../types";

type LeadsTableProps = {
  leads: Lead[];
  loading: boolean;
  onStatusChange: (
    leadId: string,
    status: LeadStatus
  ) => Promise<void>;
};

export default function LeadsTable({
  leads,
  loading,
  onStatusChange,
}: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dealerFilter, setDealerFilter] = useState("All");

  const filteredLeads = useMemo(function () {
    return leads.filter(function (lead) {
      const searchText = search.toLowerCase();

      const matchesSearch =
        lead.name.toLowerCase().includes(searchText) ||
        lead.mobile.includes(search) ||
        lead.pincode.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        lead.status === statusFilter;

      const matchesDealer =
        dealerFilter === "All" ||
        lead.dealerId === dealerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDealer
      );
    });
  }, [leads, search, statusFilter, dealerFilter]);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Customer Records
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            All Leads
          </h3>
        </div>

        <span className="text-sm text-slate-500">
          {filteredLeads.length} records
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-200 p-5 md:grid-cols-3">
        <input
          className={inputClass}
          type="search"
          placeholder="Search name, mobile or PIN..."
          value={search}
          onChange={function (event) {
            setSearch(event.target.value);
          }}
        />

        <select
          className={inputClass}
          value={statusFilter}
          onChange={function (event) {
            setStatusFilter(event.target.value);
          }}
        >
          <option value="All">All statuses</option>

          {statuses.map(function (status) {
            return (
              <option key={status} value={status}>
                {status}
              </option>
            );
          })}
        </select>

        <select
          className={inputClass}
          value={dealerFilter}
          onChange={function (event) {
            setDealerFilter(event.target.value);
          }}
        >
          <option value="All">All dealers</option>

          {dealers.map(function (dealer) {
            return (
              <option
                key={dealer.dealer_id}
                value={dealer.dealer_id}
              >
                {dealer.dealer_name}
              </option>
            );
          })}

          <option value="INHOUSE">In-house Sales</option>
        </select>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Connecting to Firebase...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No leads found. Add a lead or change your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Mobile</th>
                <th className="px-4 py-3 font-semibold">PIN Code</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Dealer</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(function (lead) {
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {lead.name}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {lead.mobile}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {lead.pincode}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {lead.product}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {lead.dealerName}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {lead.source}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        aria-label={"Status for " + lead.name}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-emerald-600"
                        value={lead.status}
                        onChange={function (event) {
                          void onStatusChange(
                            lead.id,
                            event.target.value as LeadStatus
                          );
                        }}
                      >
                        {statuses.map(function (status) {
                          return (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}