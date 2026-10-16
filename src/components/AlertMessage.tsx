type AlertMessageProps = {
  message: string;
  type: "success" | "error";
};

export default function AlertMessage({
  message,
  type,
}: AlertMessageProps) {
  if (!message) {
    return null;
  }

  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {message}
    </div>
  );
}