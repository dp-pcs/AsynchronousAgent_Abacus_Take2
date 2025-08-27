
'use client'

import { Trophy, Target, TrendingUp, Award } from 'lucide-react'
import { type LeaderboardStats } from '@/lib/api'
import { motion } from 'framer-motion'

interface LeaderboardProps {
  stats: LeaderboardStats | null
}

export default function Leaderboard({ stats }: LeaderboardProps) {
  if (!stats) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const getBrierScoreRating = (score?: number | null) => {
    if (!score) return { label: 'No data', color: 'text-gray-500', icon: Target }
    if (score <= 0.1) return { label: 'Superforecaster', color: 'text-green-600', icon: Award }
    if (score <= 0.2) return { label: 'Expert', color: 'text-blue-600', icon: Trophy }
    if (score <= 0.3) return { label: 'Good', color: 'text-yellow-600', icon: TrendingUp }
    return { label: 'Learning', color: 'text-orange-600', icon: Target }
  }

  const brierRating = getBrierScoreRating(stats.average_brier_score)
  const IconComponent = brierRating.icon

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span>Your Performance</span>
      </h3>

      <div className="space-y-4">
        {/* Brier Score */}
        {stats.average_brier_score !== null && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <IconComponent className={`w-5 h-5 ${brierRating.color}`} />
              <div>
                <div className="font-medium text-gray-900">Brier Score</div>
                <div className={`text-sm ${brierRating.color}`}>{brierRating.label}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {stats.average_brier_score.toFixed(3)}
              </div>
            </div>
          </div>
        )}

        {/* Accuracy Rate */}
        {stats.accuracy_rate !== null && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900">Accuracy Rate</div>
                <div className="text-sm text-gray-600">Directional accuracy</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {(stats.accuracy_rate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Resolution Progress</span>
            <span className="font-medium text-gray-900">
              {stats.resolved_predictions} / {stats.total_predictions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: stats.total_predictions > 0 
                  ? `${(stats.resolved_predictions / stats.total_predictions) * 100}%` 
                  : '0%' 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-primary-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-1">💡 Tip</h4>
          <p className="text-sm text-blue-700">
            {stats.average_brier_score === null 
              ? "Resolve some predictions to see your Brier score!" 
              : stats.average_brier_score <= 0.1
              ? "Excellent forecasting! You're in the top tier."
              : stats.average_brier_score <= 0.25
              ? "Good work! Try to be more confident in obvious outcomes."
              : "Focus on calibrating your confidence levels with reality."
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}
