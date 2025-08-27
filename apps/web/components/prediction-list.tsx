
'use client'

import { useState } from 'react'
import { Calendar, Tag, TrendingUp, CheckCircle, Clock, Trophy, X } from 'lucide-react'
import { api, type Prediction } from '@/lib/api'
import { format, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface PredictionListProps {
  predictions: Prediction[]
  loading: boolean
  onPredictionResolved: (prediction: Prediction) => void
}

interface ResolveDialogProps {
  prediction: Prediction
  onClose: () => void
  onResolve: (prediction: Prediction) => void
}

function ResolveDialog({ prediction, onClose, onResolve }: ResolveDialogProps) {
  const [outcome, setOutcome] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResolve = async () => {
    if (outcome === null) {
      setError('Please select an outcome')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const resolved = await api.resolvePrediction(prediction.id, { outcome })
      onResolve(resolved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resolve Prediction</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">"{prediction.statement}"</p>
          
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-gray-900">What was the outcome?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setOutcome(1)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  outcome === 1 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Correct</div>
                  <div className="text-xs text-gray-500">Prediction came true</div>
                </div>
              </button>
              
              <button
                onClick={() => setOutcome(0)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  outcome === 0 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <X className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Incorrect</div>
                  <div className="text-xs text-gray-500">Prediction was wrong</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              className="btn-primary flex-1"
              disabled={loading || outcome === null}
            >
              {loading ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PredictionCard({ prediction, onResolve }: { 
  prediction: Prediction, 
  onResolve: (prediction: Prediction) => void 
}) {
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  
  const isOverdue = prediction.status === 'open' && isPast(new Date(prediction.due_at))
  const confidencePercentage = Math.round(prediction.confidence * 100)
  
  const getBrierScoreColor = (score?: number | null) => {
    if (!score) return 'text-gray-500'
    if (score <= 0.1) return 'text-green-600'
    if (score <= 0.25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBrierScoreLabel = (score?: number | null) => {
    if (!score) return 'N/A'
    if (score <= 0.1) return 'Excellent'
    if (score <= 0.25) return 'Good'
    return 'Poor'
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card hover:shadow-lg transition-all duration-300 border-l-4 ${
          prediction.status === 'resolved' 
            ? 'border-l-green-400' 
            : isOverdue 
              ? 'border-l-red-400'
              : 'border-l-blue-400'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-gray-900 font-medium mb-2 leading-relaxed">
              {prediction.statement}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>{prediction.category}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(prediction.due_at), 'MMM d, yyyy')}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>{confidencePercentage}% confident</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {prediction.status === 'resolved' ? (
              <div className="text-right">
                <div className="text-sm font-medium text-green-600 mb-1">
                  {prediction.outcome === 1 ? 'Correct' : 'Incorrect'}
                </div>
                {prediction.brier_score !== null && prediction.brier_score !== undefined && (
                  <div className={`text-xs ${getBrierScoreColor(prediction.brier_score)}`}>
                    Brier: {prediction.brier_score.toFixed(3)} ({getBrierScoreLabel(prediction.brier_score)})
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowResolveDialog(true)}
                className="btn-primary text-sm px-3 py-1.5 flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolve</span>
              </button>
            )}
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              prediction.status === 'resolved' 
                ? 'bg-green-100 text-green-800' 
                : isOverdue
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {prediction.status === 'resolved' ? 'Resolved' : isOverdue ? 'Overdue' : 'Open'}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResolveDialog && (
          <ResolveDialog
            prediction={prediction}
            onClose={() => setShowResolveDialog(false)}
            onResolve={onResolve}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function PredictionList({ predictions, loading, onPredictionResolved }: PredictionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!predictions?.length) {
    return (
      <div className="card text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
        <p className="text-gray-600">Create your first prediction to start tracking your forecasting accuracy.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {predictions.map(prediction => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            onResolve={onPredictionResolved}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
