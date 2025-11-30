"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PollCard from "@/components/PollCard"

export default function Page() {
  const { data: session, status } = useSession()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      setLoading(false)
      return
    }

    fetch(`/api/polls?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        const pollsData = data.polls || data
        const expiredPolls = pollsData.filter((poll: any) => new Date(poll.expiresAt) <= new Date())
        setPolls(expiredPolls)
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status, currentPage])

  if (loading || status === "loading") {
    return (
      <div className="lg:ml-56 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="lg:ml-56 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in required</h2>
          <p className="text-slate-400 mb-6">Please sign in to view poll history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:ml-56 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-7xl mx-auto">
        {polls.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📜</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No expired polls</h2>
              <p className="text-slate-400 mb-6">Expired polls will appear here</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View Active Polls
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {polls.map((poll: any, index: number) => (
              <div
                key={poll.id}
                className="fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PollCard poll={poll} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {polls.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
