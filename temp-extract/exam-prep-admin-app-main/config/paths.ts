export const paths = {
  auth: {
    signIn: {
      path: "/sign-in",
      getHref: (redirectTo?: string | null | undefined) =>
        `/sign-in${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
        }`,
    },
  },

  app: {
    dashboard: {
      path: "/",
      getHref: () => "/",
    },
    users: {
      path: "/users",
      getHref: (filter?: string) =>
        `/users${filter ? `?filter=${filter}` : ""}`,
    },
    userDetail: {
      path: "/users/:id",
      getHref: (id: string) => `/users/${id}`,
    },
    exams: {
      path: "/exams",
      getHref: (filter?: string) =>
        `/exams${filter ? `?filter=${filter}` : ""}`,
    },
    examDetail: {
      path: "/exams/:id",
      getHref: (id: string) => `/exams/${id}`,
    },
    subjects: {
      path: "/subjects",
      getHref: (filter?: string) =>
        `/subjects${filter ? `?filter=${filter}` : ""}`,
      getQuestionEditorHref: (subjectId: string, mode: "new" | "all") =>
        `/subjects/${subjectId}/questions/${mode}`,
    },
    subjectDetail: {
      path: "/subjects/:id",
      getHref: (id: string) => `/subjects/${id}`,
    },
    courses: {
      path: "/courses",
      getHref: (filter?: string) =>
        `/courses${filter ? `?filter=${filter}` : ""}`,
    },
    institutions: {
      path: "/institutions",
      getHref: (filter?: string) =>
        `/institutions${filter ? `?filter=${filter}` : ""}`,
    },
    institutionDetail: {
      path: "/institutions/:id",
      getHref: (id: string) => `/institutions/${id}`,
    },
    tutorials: {
      path: "/tutorials",
      getHref: (filter?: string) =>
        `/tutorials${filter ? `?filter=${filter}` : ""}`,
    },
    mock: {
      path: "/mock",
      getHref: (filter?: string) => `/mock${filter ? `?filter=${filter}` : ""}`,
    },
    questions: {
      path: "/questions",
      getHref: (filter?: string) =>
        `/questions${filter ? `?filter=${filter}` : ""}`,
    },
    tickets: {
      path: "/tickets",
      getHref: (filter?: string) =>
        `/tickets${filter ? `?filter=${filter}` : ""}`,
    },
    notifications: {
      path: "/notifications",
      getHref: () => "/notifications",
    },
    sales: {
      path: "/sales",
      getHref: (filter?: string) =>
        `/sales${filter ? `?filter=${filter}` : ""}`,
    },
    settings: {
      path: "/settings",
      getHref: () => "/settings",
    },
  },
} as const;
