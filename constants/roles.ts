export const ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  TEACHER: "TEACHER",
  CONTENT_CREATOR: "CONTENT_CREATOR",
  SUPPORT_STAFF: "SUPPORT_STAFF",
  EMPLOYEE: "EMPLOYEE",
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]
