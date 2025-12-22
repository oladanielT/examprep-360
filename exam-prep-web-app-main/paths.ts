export const paths = {
  auth: {
    register: {
      getHref: (redirectTo?: string | null | undefined) =>
        `/register${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
        }`,
    },
    signin: {
      getHref: (redirectTo?: string | null | undefined) =>
        `/sign-in${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
        }`,
    },
    verifyEmail: {
      getHref: () => "/verify-email",
    },
    welcome: {
      getHref: () => "/welcome",
    },
  },

  app: {
    root: {
      getHref: () => "/",
    },

    textbooks: {
      getHref: () => "/textbooks",
    },
    tests: {
      getHref: () => "/tests",
      exams: {
        getHref: () => "/tests/exams",
      },
    },
    tutorials: {
      getHref: () => `/tutorials`,
    },
    leaderboard: {
      getHref: () => "/leaderboard",
    },
    activities: {
      getHref: () => "/activities",
    },
    settings: {
      getHref: () => "/settings",
    },
    subscription: {
      getHref: () => "/subscription",
    },
  },
} as const;
