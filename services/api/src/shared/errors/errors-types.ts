import type { ErrorCodes } from './codes'

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export interface AppErrorParams {
  code: ErrorCode
  message: string
  status?: number
  details?: unknown
}

export interface ValidationIssue {
  campo: string
  mensaje: string
}
