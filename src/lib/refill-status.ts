// Shared by server and client code, so it lives outside the server-only data layer.
export const REFILL_STATUSES = ["need_now", "running_low", "ok"] as const;
export type RefillStatus = (typeof REFILL_STATUSES)[number];

export const REFILL_STATUS_OPTIONS: { value: RefillStatus; label: string }[] = [
  { value: "ok", label: "OK" },
  { value: "running_low", label: "Running low" },
  { value: "need_now", label: "Need now" },
];
