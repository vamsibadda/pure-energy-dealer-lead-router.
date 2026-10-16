import { useState } from "react";
import type { FormEvent } from "react";

import { findDealer } from "../data/dealers";
import {
  emptyForm,
  products,
  sources,
} from "../data/options";

import type { LeadFormData } from "../types";
import AlertMessage from "./AlertMessage";

type LeadFormProps = {
  onCreateLead: (form: LeadFormData) => Promise<void>;
  saving: boolean;
};

export default function LeadForm({
  onCreateLead,
  saving,
}: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(
    field: keyof LeadFormData,
    value: string
  ) {
    setForm(function (previousForm) {
      return {
        ...previousForm,
        [field]: value,
      };
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const pincode = form.pincode.trim();

    if (!name) {
      setError("Please enter the customer's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("PIN code must contain exactly 6 digits.");
      return;
    }

    try {
      await onCreateLead({
        ...form,
        name: name,
        mobile: mobile,
        pincode: pincode,
      });

      const dealerName =
        findDealer(pincode)?.dealer_name ?? "In-house Sales";

      setSuccess(
        "Lead created and assigned to " + dealerName + "."
      );

      setForm({ ...emptyForm });
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not save the lead.";

      setError(message);
    }
  }

  const assignedDealer =
    form.pincode.length === 6
      ? findDealer(form.pincode)?.dealer_name ?? "In-house Sales"
      : "Enter a valid 6-digit PIN code";

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Lead Management
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Create a New Lead
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Enter the customer's details to automatically assign a dealer.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Customer Information
          </h3>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            New Lead
          </span>
        </div>

        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className={labelClass}>
            Customer Name

            <input
              className={inputClass}
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={function (event) {
                updateField("name", event.target.value);
              }}
              required
            />
          </label>

          <label className={labelClass}>
            Mobile Number

            <input
              className={inputClass}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={function (event) {
                updateField(
                  "mobile",
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                );
              }}
              required
            />
          </label>

          <label className={labelClass}>
            PIN Code

            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN code"
              value={form.pincode}
              onChange={function (event) {
                updateField(
                  "pincode",
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
              }}
              required
            />
          </label>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Automatic Dealer Assignment
            </p>

            <p className="mt-2 font-bold text-emerald-950">
              {assignedDealer}
            </p>

            <p className="mt-1 text-xs text-emerald-800">
              Assignment is based on the first 3 PIN digits.
            </p>
          </div>

          <label className={labelClass}>
            Product

            <select
              className={inputClass}
              value={form.product}
              onChange={function (event) {
                updateField("product", event.target.value);
              }}
            >
              {products.map(function (product) {
                return (
                  <option key={product} value={product}>
                    {product}
                  </option>
                );
              })}
            </select>
          </label>

          <label className={labelClass}>
            Lead Source

            <select
              className={inputClass}
              value={form.source}
              onChange={function (event) {
                updateField("source", event.target.value);
              }}
            >
              {sources.map(function (source) {
                return (
                  <option key={source} value={source}>
                    {source}
                  </option>
                );
              })}
            </select>
          </label>

          <button
            className="w-full rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving Lead..." : "Save and Assign Lead"}
          </button>
        </form>
      </div>
    </section>
  );
}