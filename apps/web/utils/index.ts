
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

export function getBrierScoreRating(score: number): {
  label: string
  color: string
  description: string
} {
  if (score <= 0.1) {
    return {
      label: 'Excellent',
      color: 'text-green-600',
      description: 'Superforecaster level'
    }
  } else if (score <= 0.2) {
    return {
      label: 'Good',
      color: 'text-blue-600', 
      description: 'Above average'
    }
  } else if (score <= 0.3) {
    return {
      label: 'Fair',
      color: 'text-yellow-600',
      description: 'Room for improvement'
    }
  } else {
    return {
      label: 'Poor',
      color: 'text-red-600',
      description: 'Needs calibration'
    }
  }
}

export function calculateBrierScore(confidence: number, outcome: number): number {
  return Math.pow(confidence - outcome, 2)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isOverdue(dueDate: string | Date): boolean {
  return new Date(dueDate) < new Date()
}
