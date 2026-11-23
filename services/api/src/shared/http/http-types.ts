import type { ErrorCode } from '@shared/errors/errors-types'
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

export interface ApiError {
  code: ErrorCode
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data: T | null
  status: number
  error: ApiError | null
}

export type LambdaResponse = APIGatewayProxyStructuredResultV2
export type PublicEvent = APIGatewayProxyEventV2
export type AuthEvent = APIGatewayProxyEventV2WithJWTAuthorizer
export type HttpHandler<E> = (event: E) => Promise<LambdaResponse>
