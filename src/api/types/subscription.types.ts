export interface ChangeSubscriptionSubjectsRequest {
  subjects: string[];
  courses: string[];
}

export interface UserSubscription {
  id: string;
  studentId: string;
  subscriptionId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string | null;
  subjects: string[];
  courses: string[];
  examType: string;
  examTypeId: string;
  departmentId: string | null;
  paymentMethod: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    name: string;
    description: string;
  };
}
