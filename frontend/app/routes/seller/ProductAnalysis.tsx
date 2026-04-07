import type { Route } from './+types/ProductAnalysis'
import type { ProductType } from '~/types'
import { useLoaderData, useNavigate } from 'react-router'

type ProductAnalysisLoaderData = {
  data: ProductType | null
  analysis: {
    total_reviews: number,
    positive: number,
    negative: number,
    neutral: number,
    positive_pct: number,
    negative_pct: number,
    neutral_pct: number
  } | null
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
    const analysisData = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/sentiment-analysis`)

    if (!analysisData.ok) return { data: null }
    if (!res.ok) return { data: null }

    const analysis = await analysisData.json()
    const data: ProductType = await res.json()
    return { data, analysis }
  } catch {
    return { data: null, analysis: null }
  }
}

function SentimentBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function ProductAnalysis() {
  const navigate = useNavigate()
  const { data: product, analysis } = useLoaderData() as ProductAnalysisLoaderData

  if (!product) {
    return (
      <section className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Error</p>
          <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
            Product not found
          </h1>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">



      {/* Top rule */}
      <div className="w-full h-[3px] bg-[#AB2320]" />
      <button onClick={() => navigate(-1)} className='px-5 py-2 font-bold text-[#d32f2c] hover:text-[#9c120f] hover:scale-103 transition-all mt-5 ml-5 cursor-pointer'>
        Go Back
      </button>

      <section className="max-w-4xl mx-auto px-6 py-14">

        {/* Eyebrow label */}
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-6"
          style={{ fontFamily: "'system-ui', sans-serif" }}>
          Product Analysis
        </p>

        {/* Product Header */}
        <div className="border-b border-gray-200 pb-10 mb-10">
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                {product.title}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mt-3"
                style={{ fontFamily: "system-ui, sans-serif" }}>
                {product.category}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1"
                style={{ fontFamily: "system-ui, sans-serif" }}>Price</p>
              <p className="text-3xl font-bold text-[#AB2320]">
                Rs. {Math.ceil(product.price).toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-gray-600 mt-6 text-base leading-relaxed max-w-2xl">
            {product.description}
          </p>
        </div>

        {/* Analysis Section */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Sentiment Analysis
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
            {analysis && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400"
                style={{ fontFamily: "system-ui, sans-serif" }}>
                {analysis.total_reviews} reviews
              </span>
            )}
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Positive */}
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400"
                    style={{ fontFamily: "system-ui, sans-serif" }}>Positive</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">{analysis.positive}</p>
                <p className="text-sm text-gray-400 mb-4"
                  style={{ fontFamily: "system-ui, sans-serif" }}>
                  {analysis.positive_pct?.toFixed(1) ?? 0}%
                </p>
                <SentimentBar pct={analysis.positive_pct ?? 0} color="#10b981" />
              </div>

              {/* Negative */}
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400"
                    style={{ fontFamily: "system-ui, sans-serif" }}>Negative</p>
                  <span className="w-2 h-2 rounded-full bg-[#AB2320] block" />
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">{analysis.negative}</p>
                <p className="text-sm text-gray-400 mb-4"
                  style={{ fontFamily: "system-ui, sans-serif" }}>
                  {analysis.negative_pct?.toFixed(1) ?? 0}%
                </p>
                <SentimentBar pct={analysis.negative_pct ?? 0} color="#AB2320" />
              </div>

              {/* Neutral */}
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400"
                    style={{ fontFamily: "system-ui, sans-serif" }}>Neutral</p>
                  <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">{analysis.neutral}</p>
                <p className="text-sm text-gray-400 mb-4"
                  style={{ fontFamily: "system-ui, sans-serif" }}>
                  {analysis.neutral_pct?.toFixed(1) ?? 0}%
                </p>
                <SentimentBar pct={analysis.neutral_pct ?? 0} color="#f59e0b" />
              </div>

            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-lg p-12 text-center">
              <p className="text-sm text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
                No analysis data available for this product.
              </p>
            </div>
          )}
        </div>

      </section>
    </div>
  )
}

export default ProductAnalysis