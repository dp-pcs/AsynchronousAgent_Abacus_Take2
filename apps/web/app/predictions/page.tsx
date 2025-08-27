
import PredictionDashboard from '@/components/prediction-dashboard'

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Predictions</h1>
          <p className="text-gray-600">Create, track, and resolve your predictions to measure your forecasting accuracy.</p>
        </div>
        <PredictionDashboard />
      </div>
    </div>
  )
}
