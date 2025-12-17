/**
 * Types for the Position Parser feature.
 */

/** A single policy position extracted from content */
export interface PolicyPosition {
  stance: string
  source_urls: string[]
  note?: string | null
}

/** Full response from the parser backend */
export interface ParserResponse {
  politician_name?: string | null
  positions: PolicyPosition[]
  warnings?: string[] | null
}

/** SSE progress event */
export interface SSEProgressEvent {
  type: 'progress'
  message: string
}

/** SSE result event */
export interface SSEResultEvent {
  type: 'result'
  data: ParserResponse
}

/** SSE error event */
export interface SSEErrorEvent {
  type: 'error'
  message: string
}

/** Union of all SSE event types */
export type SSEEvent = SSEProgressEvent | SSEResultEvent | SSEErrorEvent
