import { dealers } from "../data/dealers";
import { statuses } from "../data/options";
import type { Lead } from "../types";

type DashboardProps = {
  leads: Lead[];
};

export default function Dashboard({ leads }: DashboardProps) {
  const statusCounts = statuses.map(function (status) {
    return {
      name: status,
      count: leads.filter(function (lead) {
        return lead.status === status;
      }).length,
    };
  });

  const dealerCounts = dealers.map(function (dealer) {
    return {
      ...dealer,
      count: leads.filter(function (lead) {
        return lead.dealerId === dealer.dealer_id;
      }).length,
    };
  });

  const inHouseCount = leads.filter(function (lead) {
    return lead.dealerId === "INHOUSE";
  }).length;

  const statCards = [
    {
      label: "Total Leads",
      count: leads.length,
      description: "All recorded leads",
    },
    {
      label: "New Leads",
      count: statusCounts[0].count,
      description: "Awaiting contact",
    },
    {
      label: "Converted",
      count: statusCounts[2].count,
      description: "Successful leads",
    },
    {
      label: "In-house Sales",
      count: inHouseCount,
      description: "No dealer prefix match",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Overview
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Lead Management Dashboard
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Monitor lead progress and dealer performance.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(function (card) {
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {card.label}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {card.count}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Leads by Status
          </h3>

          <div className="mt-6 space-y-5">
            {statusCounts.map(function (item) {
              const percentage =
                leads.length === 0
                  ? 0
                  : (item.count / leads.length) * 100;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>

                    <span className="font-bold text-slate-900">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: percentage + "%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Leads by Dealer
          </h3>

          <div className="mt-4 divide-y divide-slate-100">
            {dealerCounts.map(function (dealer) {
              return (
                <div
                  key={dealer.dealer_id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800">
                    {dealer.city.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {dealer.dealer_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {dealer.city}
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800">
                    {dealer.count}
                  </span>
                </div>
              );
            })}

            <div className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-800">
                IH
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  In-house Sales
                </p>

                <p className="text-xs text-slate-500">
                  No matching PIN prefix
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800">
                {inHouseCount}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}