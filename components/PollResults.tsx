"use client"

import { useState, useEffect } from "react"

interface VoteResult {
  voter: string
  email: string
  option: string
  votedAt: string
}

interface PollResultsProps {
  pollId: string
  isOwner: boolean
}

export default function PollResults({ pollId, isOwner }: PollResultsProps) {
  const [results, setResults] = useState<VoteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/polls/${pollId}/results`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to fetch results")
      }
    } catch (error) {
      console.error("Failed to fetch results:", error)
      alert("Failed to fetch results")
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    setExporting(true)
    try {
      console.log('Starting CSV export for poll:', pollId)
      const res = await fetch(`/api/polls/${pollId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const blob = await res.blob()
        console.log('Blob size:', blob.size)
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `poll-results-${pollId}-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)
        
        alert('✅ CSV downloaded successfully!')
      } else {
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await res.json()
          console.error('Export error:', error)
          alert(`❌ ${error.error || "Failed to export CSV"}`)
        } else {
          const text = await res.text()
          console.error('Export error (text):', text)
          alert('❌ Failed to export CSV')
        }
      }
    } catch (error) {
      console.error("Failed to export:", error)
      alert(`❌ Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const handleToggle = () => {
    if (!showResults && results.length === 0) {
      fetchResults()
    }
    setShowResults(!showResults)
  }

  if (!isOwner) {
    return null
  }

  return (
    <div className="mt-6 border-t border-slate-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">
            {showResults ? 'Hide' : 'View'} Detailed Results
          </span>
          <span className="text-xs text-slate-500">(Owner Only)</span>
        </button>

        {showResults && results.length > 0 && (
          <button
            onClick={exportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        )}
      </div>

      {showResults && (
        <div className="bg-slate-800 rounded-lg p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-blue-500"></div>
              <p className="text-slate-400 mt-2">Loading results...</p>
            </div>
          ) : results.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No votes yet</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 pb-2 border-b border-slate-700">
                <span className="flex-1">Voter</span>
                <span className="flex-1">Selected Option</span>
                <span className="w-32">Voted At</span>
              </div>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50">
                  <div className="flex-1">
                    <p className="text-white font-medium">{result.voter}</p>
                    <p className="text-xs text-slate-500">{result.email}</p>
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                      {result.option}
                    </span>
                  </div>
                  <div className="w-32 text-xs text-slate-400">
                    {new Date(result.votedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-sm text-slate-400">
                Total: {results.length} vote{results.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
