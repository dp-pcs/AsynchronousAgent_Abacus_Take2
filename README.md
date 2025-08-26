
# Prediction App

A full-stack application for making, tracking, and scoring predictions using scientific Brier score methodology.

## Features

- **Create Predictions**: Make predictions with confidence levels (1-99%) and due dates
- **Track Outcomes**: Resolve predictions as Win/Loss when they come due
- **Scientific Scoring**: Calculate Brier scores to measure forecasting accuracy
- **Categories**: Organize predictions by category (Politics, Sports, Weather, etc.)
- **Leaderboard**: Track your performance with statistics and scoring trends

## Tech Stack

### Backend (FastAPI)
- **FastAPI**: Modern Python web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations  
- **SQLite**: Lightweight database for local storage
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for running the FastAPI application

### Frontend (Next.js)
- **Next.js 14**: React framework with App Router
- **React 18**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Modern icon set

## Project Structure

```
prediction_app/
├── services/api/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # Database models and setup
│   │   ├── schemas.py           # Pydantic models
│   │   ├── scoring.py           # Brier score calculation
│   │   └── predictions.db       # SQLite database (created at runtime)
│   ├── tests/                   # Python tests
│   ├── requirements.txt         # Python dependencies
│   └── venv/                    # Virtual environment
├── apps/web/                    # Next.js frontend
│   ├── app/                     # App Router pages
│   ├── components/              # React components
│   ├── lib/                     # Utility libraries
│   ├── utils/                   # Helper functions
│   └── __tests__/               # JavaScript tests
└── README.md                    # This file
```

## Database Schema

### Predictions Table
- `id`: Primary key
- `statement`: The prediction text
- `category`: Category for organization
- `confidence`: Confidence level (0.01-0.99)
- `due_at`: When the prediction should be resolved
- `status`: "open" or "resolved"
- `outcome`: 0 (incorrect) or 1 (correct), nullable until resolved
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**: 
- `(status, due_at)` for efficient filtering
- `category` for category-based queries

## API Endpoints

### Predictions
- `POST /predictions` - Create a new prediction
- `GET /predictions` - List predictions (with optional status/category filters)
- `POST /predictions/{id}/resolve` - Resolve a prediction with outcome

### Statistics
- `GET /stats/leaderboard` - Get user statistics and performance metrics

All endpoints return JSON and use HTTP status codes for error handling.

## Brier Score Calculation

The Brier score measures the accuracy of probabilistic predictions using the formula:

```
Brier Score = (probability - outcome)²
```

Where:
- `probability` is your confidence level (0.01 to 0.99)
- `outcome` is the actual result (0 for incorrect, 1 for correct)

**Score Interpretation**:
- `0.00-0.10`: Excellent (Superforecaster level)
- `0.11-0.20`: Good (Above average)
- `0.21-0.30`: Fair (Room for improvement)
- `0.31+`: Poor (Needs calibration)

Lower scores are better. A perfectly calibrated forecaster achieves the lowest possible Brier score.

## Setup Instructions

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Yarn or npm

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd services/api
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # or npm run dev
   ```

   The web app will be available at `http://localhost:3000`

## Running Tests

### Backend Tests
```bash
cd services/api
source venv/bin/activate
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd apps/web
yarn test
# or npm test
```

## Usage Guide

### Making Your First Prediction

1. Visit `http://localhost:3000` and click "Start Predicting"
2. Click "New Prediction" to create your first prediction
3. Fill out the form:
   - **Statement**: What you think will happen
   - **Category**: Organize your predictions (e.g., "Sports", "Politics")
   - **Confidence**: How confident you are (1-99%)
   - **Due Date**: When the prediction should be resolved
4. Click "Create Prediction"

### Resolving Predictions

1. When a prediction's due date arrives, click the "Resolve" button
2. Select whether your prediction was **Correct** or **Incorrect**
3. Your Brier score will be calculated automatically

### Understanding Your Performance

- **Brier Score**: Lower is better (0.00 = perfect)
- **Accuracy Rate**: Percentage of predictions where you were directionally correct
- **Categories**: See which topics you predict best/worst

### Tips for Better Forecasting

1. **Calibrate Confidence**: If you're right 70% of the time when 70% confident, you're well-calibrated
2. **Avoid Overconfidence**: Reserve 95%+ confidence for nearly certain events
3. **Track Categories**: Some domains may be easier to predict than others
4. **Learn from Mistakes**: Review resolved predictions to improve

## Development

### Adding New Features

1. **Backend Changes**: Modify FastAPI endpoints in `services/api/app/`
2. **Frontend Changes**: Update React components in `apps/web/`
3. **Database Changes**: Update SQLAlchemy models in `database.py`

### API Documentation

When running the backend, visit `http://localhost:8000/docs` for interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
