
import Link from 'next/link'
import { TrendingUp, Target, BarChart3, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
            Track Your <span className="text-primary-500">Predictions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            Make predictions about future events, track their outcomes, and measure your forecasting accuracy with scientific Brier scores.
          </p>
          <Link 
            href="/predictions" 
            className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 animate-slide-up"
          >
            <Target className="w-5 h-5" />
            <span>Start Predicting</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center animate-slide-up">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Predictions</h3>
            <p className="text-gray-600">
              Create predictions with confidence levels and due dates across different categories.
            </p>
          </div>

          <div className="card text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Outcomes</h3>
            <p className="text-gray-600">
              Resolve your predictions when the time comes and see how accurate you were.
            </p>
          </div>

          <div className="card text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Measure Accuracy</h3>
            <p className="text-gray-600">
              Get scientific Brier scores to quantify your forecasting performance over time.
            </p>
          </div>
        </div>

        <div className="card max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are Brier Scores?</h3>
              <p className="text-gray-600 leading-relaxed">
                Brier scores measure the accuracy of probabilistic predictions on a scale from 0 to 1, where 0 is perfect accuracy. 
                The score is calculated as (probability - outcome)², so confident correct predictions get better scores than 
                uncertain correct ones, encouraging well-calibrated forecasting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
