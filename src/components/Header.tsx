import { NavLink } from "react-router-dom";

export default function Header() {
  function getLinkClass(isActive: boolean) {
    return isActive
      ? "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100";
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-xl font-bold text-white">
            P
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              PURE Energy
            </h1>
            <p className="text-sm text-slate-500">
              Dealer Lead Router
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <NavLink
            to="/"
            end
            className={function ({ isActive }) {
              return getLinkClass(isActive);
            }}
          >
            + Lead Form
          </NavLink>

          <NavLink
            to="/dashboard"
            className={function ({ isActive }) {
              return getLinkClass(isActive);
            }}
          >
            View Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}