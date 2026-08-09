export default function AlertBox({ type = "error", message }) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  if (!message) return null;
  return (
    <div className={`rounded-xl border p-4 text-xs font-medium ${styles[type] || styles.error}`}>
      {message}
    </div>
  );
}
