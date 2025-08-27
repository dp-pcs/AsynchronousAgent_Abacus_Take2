
'use client'

import { useState } from 'react'
import { X, Calendar, Target, Tag, FileText } from 'lucide-react'
import { api, type PredictionCreate, type Prediction } from '@/lib/api'
import { format, addDays } from 'date-fns'
import { motion } from 'framer-motion'

interface PredictionFormProps {
  onClose: () => void
  onSubmit: (prediction: Prediction) => void
}

export default function PredictionForm({ onClose, onSubmit }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionCreate>({
    statement: '',
    category: '',
    confidence: 0.5,
    due_at: format(addDays(new Date(), 7), 'yyyy-MM-dd\'T\'HH:mm')
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.statement?.trim()) {
      setError('Prediction statement is required')
      return
    }
    
    if (!formData.category?.trim()) {
      setError('Category is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const prediction = await api.createPrediction(formData)
      onSubmit(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prediction')
    } finally {
      setLoading(false)
    }
  }

  const confidencePercentage = Math.round(formData.confidence * 100)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary-500" />
              <span>New Prediction</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Prediction Statement</span>
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                placeholder="What do you think will happen?"
                className="input-field h-24 resize-none"
                required
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Category</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Politics, Sports, Weather, Technology"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">
                Confidence: {confidencePercentage}%
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span className="text-gray-700 font-medium">{confidencePercentage}%</span>
                  <span>99%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </label>
              <input
                type="datetime-local"
                value={formData.due_at}
                onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                className="input-field"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Prediction'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
