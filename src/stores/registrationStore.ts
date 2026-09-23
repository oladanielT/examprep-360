import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserType = "secondary" | "undergraduate" | "professional" | "";

interface RegistrationData {
  // Step 1: User Type & Category (from welcome page)
  userType: UserType;
  category: string; // API value like "SECONDARY_SCHOOL", "UNIVERSITY_COURSE"

  // Step 2: Basic Info
  fullName: string;
  email: string;
  phone: string;
  password: string;

  // Step 3: Exam Selection
  examType: string;
  examTypeId: string;
  duration: string;
  subjects: string[];

  // Institutional license
  isInstitutional: boolean;
  students: number;
  studentEmails: string[];

  // Referral
  referralCode: string;

  // Student ID (from registration response)
  studentId: string;
}

interface RegistrationState {
  // Data
  data: RegistrationData;
  currentStep: number;

  // Actions
  setUserType: (userType: UserType, category: string) => void;
  setBasicInfo: (info: Pick<RegistrationData, "fullName" | "email" | "phone" | "password">) => void;
  setExamSelection: (info: Pick<RegistrationData, "examType" | "examTypeId" | "duration" | "subjects" | "students">) => void;
  setIsInstitutional: (isInstitutional: boolean) => void;
  setReferralCode: (referralCode: string) => void;
  setStudentId: (studentId: string) => void;
  setStep: (step: number) => void;
  reset: () => void;

  // Computed
  isComplete: () => boolean;
}

const initialData: RegistrationData = {
  userType: "",
  category: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  examType: "",
  examTypeId: "",
  duration: "",
  subjects: [],
  isInstitutional: false,
  students: 1,
  studentEmails: [],
  referralCode: "",
  studentId: "",
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,

      setUserType: (userType, category) =>
        set((state) => ({
          data: { ...state.data, userType, category },
          currentStep: 2,
        })),

      setBasicInfo: (info) =>
        set((state) => ({
          data: { ...state.data, ...info },
          currentStep: 3,
        })),

      setExamSelection: (info) =>
        set((state) => ({
          data: { ...state.data, ...info },
          currentStep: 4,
        })),

      setIsInstitutional: (isInstitutional) =>
        set((state) => ({
          data: { ...state.data, isInstitutional },
        })),

      setReferralCode: (referralCode) =>
        set((state) => ({
          data: { ...state.data, referralCode },
        })),

      setStudentId: (studentId) =>
        set((state) => ({
          data: { ...state.data, studentId },
        })),

      setStep: (step) => set({ currentStep: step }),

      reset: () => set({ data: initialData, currentStep: 1 }),

      isComplete: () => {
        const { data } = get();
        return !!(
          data.userType &&
          data.fullName &&
          data.email &&
          data.password &&
          data.examType &&
          data.subjects.length > 0
        );
      },
    }),
    {
      name: "exprep-registration",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage so it clears on browser close
      partialize: (state) => ({
        data: { ...state.data, password: "" }, // Never persist password
        currentStep: state.currentStep,
      }),
    }
  )
);

// Selector hooks
export const useRegistrationData = () => useRegistrationStore((state) => state.data);
export const useCurrentStep = () => useRegistrationStore((state) => state.currentStep);
