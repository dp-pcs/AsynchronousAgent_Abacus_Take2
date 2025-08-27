
/**
 * @jest-environment jsdom
 */

import {
  formatConfidence,
  getBrierScoreRating,
  calculateBrierScore,
  isOverdue
} from '../utils/index.ts'

describe('Utils', () => {
  describe('formatConfidence', () => {
    test('formats confidence as percentage', () => {
      expect(formatConfidence(0.7)).toBe('70%')
      expect(formatConfidence(0.25)).toBe('25%')
      expect(formatConfidence(0.99)).toBe('99%')
      expect(formatConfidence(0.01)).toBe('1%')
    })
  })

  describe('getBrierScoreRating', () => {
    test('returns correct rating for different scores', () => {
      expect(getBrierScoreRating(0.05).label).toBe('Excellent')
      expect(getBrierScoreRating(0.15).label).toBe('Good')
      expect(getBrierScoreRating(0.25).label).toBe('Fair')
      expect(getBrierScoreRating(0.4).label).toBe('Poor')
    })

    test('returns correct colors', () => {
      expect(getBrierScoreRating(0.05).color).toBe('text-green-600')
      expect(getBrierScoreRating(0.15).color).toBe('text-blue-600')
      expect(getBrierScoreRating(0.25).color).toBe('text-yellow-600')
      expect(getBrierScoreRating(0.4).color).toBe('text-red-600')
    })
  })

  describe('calculateBrierScore', () => {
    test('calculates Brier score correctly', () => {
      expect(calculateBrierScore(0.7, 1)).toBeCloseTo(0.09) // (0.7 - 1)^2
      expect(calculateBrierScore(0.3, 0)).toBeCloseTo(0.09) // (0.3 - 0)^2
      expect(calculateBrierScore(0.5, 1)).toBeCloseTo(0.25) // (0.5 - 1)^2
      expect(calculateBrierScore(0.8, 0)).toBeCloseTo(0.64) // (0.8 - 0)^2
    })
  })

  describe('isOverdue', () => {
    test('returns true for past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      expect(isOverdue(pastDate)).toBe(true)
    })

    test('returns false for future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      expect(isOverdue(futureDate)).toBe(false)
    })
  })
})
