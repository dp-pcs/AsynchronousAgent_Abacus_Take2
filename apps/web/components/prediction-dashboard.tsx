
'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, TrendingUp } from 'lucide-react'
import { api, type Prediction, type LeaderboardStats } from '@/lib/api'
import PredictionForm from './forms/prediction-form'
import PredictionList from './prediction-list'
import Leaderboard from './leaderboard'
import { motion } from 'framer-motion'

export default function PredictionDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPredictions = async () => {
    try {
      setLoading(true)
      const status = statusFilter === 'all' ? undefined : statusFilter
      const category = categoryFilter === 'all' ? undefined : categoryFilter
      const data = await api.getPredictions(status, category)
      setPredictions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.getLeaderboardStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  useEffect(() => {
    loadPredictions()
    loadStats()
  }, [statusFilter, categoryFilter])

  const handlePredictionCreated = (newPrediction: Prediction) => {
    setPredictions(prev => [newPrediction, ...prev])
    setShowForm(false)
    loadStats() // Refresh stats
  }

  const handlePredictionResolved = (resolvedPrediction: Prediction) => {
    setPredictions(prev => 
      prev.map(p => p.id === resolvedPrediction.id ? resolvedPrediction : p)
    )
    loadStats() // Refresh stats
  }

  const categories = stats?.categories ? Object.keys(stats.categories) : []
  const openPredictions = predictions?.filter(p => p.status === 'open') || []
  const resolvedPredictions = predictions?.filter(p => p.status === 'resolved') || []

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button 
          onClick={loadPredictions}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.total_predictions}</div>
            <div className="text-sm text-gray-600">Total Predictions</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved_predictions}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.average_brier_score ? stats.average_brier_score.toFixed(3) : '—'}
            </div>
            <div className="text-sm text-gray-600">Avg Brier Score</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.accuracy_rate ? `${(stats.accuracy_rate * 100).toFixed(1)}%` : '—'}
            </div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Categories</option>
            {categories?.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Prediction</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <PredictionList 
            predictions={predictions}
            loading={loading}
            onPredictionResolved={handlePredictionResolved}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Leaderboard stats={stats} />
          
          {/* Categories */}
          {stats?.categories && Object.keys(stats.categories).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Categories</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Prediction Form Modal */}
      {showForm && (
        <PredictionForm 
          onClose={() => setShowForm(false)}
          onSubmit={handlePredictionCreated}
        />
      )}
    </div>
  )
}
