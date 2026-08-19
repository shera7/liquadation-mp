"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";

export default function RequestStatusSelect({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(status: string) {
    setLoading(true);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs border border-line rounded-sm px-2 py-1"
    >
      {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
