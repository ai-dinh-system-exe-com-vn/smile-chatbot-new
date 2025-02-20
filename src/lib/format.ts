import { format, formatDistanceToNow } from 'date-fns'

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  if (diffInSeconds < 7 * 24 * 60 * 60) { // Less than 7 days
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return format(date, 'MMM d, yyyy h:mm a')
}