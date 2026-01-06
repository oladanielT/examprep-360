import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserType = "secondary" | "undergraduate" | "";

interface RegistrationData {
  // Step 1: User Type (from welcome page)
  userType: UserType;

  // Step 2: Basic Info
  fullName: string;
  email: string;
  phone: string;
  password: string;

  // Step 3: Exam Selection
  examType: string;
  duration: string;
  subjects: string[];

  // Institutional license
  isInstitutional: boolean;
  students: number;
}

interface RegistrationState {
  // Data
  data: RegistrationData;
  currentStep: number;

  // Actions
  setUserType: (userType: UserType) => void;
  setBasicInfo: (info: Pick<RegistrationData, "fullName" | "email" | "phone" | "password">) => void;
  setExamSelection: (info: Pick<RegistrationData, "examType" | "duration" | "subjects" | "students">) => void;
  setIsInstitutional: (isInstitutional: boolean) => void;
  setStep: (step: number) => void;
  reset: () => void;

  // Computed
  isComplete: () => boolean;
}

const initialData: RegistrationData = {
  userType: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  examType: "",
  duration: "",
  subjects: [],
  isInstitutional: false,
  students: 1,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,

      setUserType: (userType) =>
        set((state) => ({
          data: { ...state.data, userType },
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
    }
  )
);

// Selector hooks
export const useRegistrationData = () => useRegistrationStore((state) => state.data);
export const useCurrentStep = () => useRegistrationStore((state) => state.currentStep);
