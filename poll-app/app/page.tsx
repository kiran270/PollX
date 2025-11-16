"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PollCard from "@/components/PollCard"

const CATEGORIES = ["Politics", "Sports", "Entertainment", "Technology", "Science", "Business", "Other"]

export default function Page() {
  const { data: session, status } = useSession()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchPolls = async () => {
    if (!session) {
      setLoading(false)
      return
    }

    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    if (selectedCategory !== "all") params.append("category", selectedCategory)

    try {
      const res = await fetch(`/api/polls?${params}`)
      const data = await res.json()
      
      // Check if data is an array
      if (Array.isArray(data)) {
        const activePolls = data.filter((poll: any) => new Date(poll.expiresAt) > new Date())
        setPolls(activePolls)
      } else {
        console.error("API returned non-array data:", data)
        setPolls([])
      }
    } catch (error) {
      console.error("Failed to fetch polls:", error)
      setPolls([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    fetchPolls()
  }, [session, status, searchQuery, selectedCategory])

  if (loading || status === "loading") {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in required</h2>
          <p className="text-slate-400 mb-6">Please sign in to view and vote on polls</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:ml-64 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-800 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
              />
              <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {polls.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No active polls</h2>
              <p className="text-slate-400 mb-6">Create the first poll to get started</p>
              <a
                href="/create-poll"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Create Poll
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
      </div>
    </div>
  )
}
