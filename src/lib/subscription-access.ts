interface SubscriptionAccessRecord {
  examTypeId: string;
  status: string;
  paymentMethod: string;
}

export function findActivePaidSubscription<T extends SubscriptionAccessRecord>(
  subscriptions: T[] | undefined,
  examTypeId: string | undefined,
): T | undefined {
  if (!examTypeId) return undefined;

  return subscriptions?.find(
    (subscription) =>
      subscription.examTypeId === examTypeId &&
      subscription.status === "ACTIVE" &&
      subscription.paymentMethod !== "TRIAL",
  );
}
