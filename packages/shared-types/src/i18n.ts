
export const PROJECT_LANGUAGE = {
  VI: 'vi',
  EN: 'en',
  KO: 'ko',
} as const;

export type ProjectLanguage = (typeof PROJECT_LANGUAGE)[keyof typeof PROJECT_LANGUAGE];
