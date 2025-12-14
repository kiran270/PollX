"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"

interface Option {
  id: string
  text: string
  imageUrl: string | null
  _count: {
    votes: number
  }
}

interface Poll {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  category: string | null
  isPublic: boolean
  expiresAt: string
  userId: string
  options: Option[]
  _count: {
    votes: number
    comments: number
  }
}

export default function EmbedPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    fetchPoll()
    checkVoteStatus()
  }, [id])

  const fetchPoll = async () => {
    try {
      const res = await fetch(`/api/polls/${id}`)
      const data = await res.json()
      setPoll(data)
    } catch (error) {
      // Failed to fetch poll
    } finally {
      setLoading(false)
    }
  }

  const checkVoteStatus = async () => {
    try {
      const voteRes = await fetch(`/api/polls/${id}/vote`)
      const voteData = await voteRes.json()
      setHasVoted(voteData.hasVoted)
      
      if (voteData.hasVoted && voteData.optionId) {
        setUserVote(voteData.optionId)
      }
    } catch (error) {
      console.error("Failed to check vote status:", error)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || voting) return

    setVoting(true)
    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      const data = await response.json()

      if (response.ok) {
        setHasVoted(true)
        setUserVote(selectedOption)
        fetchPoll() // Refresh poll data
      } else {
        alert(data.error || "Failed to submit vote")
      }
    } catch (error) {
      alert("Failed to submit vote")
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400 text-sm">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400">Poll not found</p>
        </div>
      </div>
    )
  }

  const totalVotes = poll._count.votes
  const getPercentage = (votes: number) => totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  const isExpired = new Date() > new Date(poll.expiresAt)

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          {/* Poll Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-white">{poll.title}</h1>
              {!poll.isPublic && (
                <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded border border-amber-500/20 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Private
                </span>
              )}
            </div>
            {poll.description && (
              <p className="text-slate-400 text-sm">{poll.description}</p>
            )}
            {poll.category && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg border border-blue-500/20">
                {poll.category}
              </span>
            )}
          </div>

          {/* Poll Image */}
          {poll.imageUrl && (
            <div className="mb-6 -mx-6">
              <img 
                src={poll.imageUrl} 
                alt={poll.title} 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Poll Options */}
          <div className="space-y-3 mb-6">
            {poll.options
              .sort((a, b) => b._count.votes - a._count.votes)
              .map((option) => {
              const voteCount = option._count.votes
              const percentage = getPercentage(voteCount)
              const isSelected = selectedOption === option.id
              const isUserVote = hasVoted && userVote === option.id

              return (
                <div key={option.id} className="relative">
                  <label className={`relative block ${hasVoted || isExpired ? "" : "cursor-pointer"}`}>
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={isSelected || isUserVote}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={hasVoted || isExpired}
                      className="sr-only"
                    />
                    <div className={`relative overflow-hidden rounded-lg border transition-all ${
                      isSelected || isUserVote ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50"
                    }`}>
                      <div className="absolute inset-0 bg-blue-500/10" style={{ width: `${percentage}%` }} />
                      <div className="relative flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {option.imageUrl && (
                            <img 
                              src={option.imageUrl} 
                              alt={option.text} 
                              className="w-10 h-10 object-cover rounded border border-slate-700"
                            />
                          )}
                          <span className="text-white font-medium text-sm">{option.text}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs">{voteCount} votes</span>
                          <span className="text-blue-400 font-bold text-sm">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && !isExpired && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || voting}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {voting ? "Submitting..." : "Submit Vote"}
            </button>
          )}

          {/* Vote Status */}
          {hasVoted && !isExpired && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <span className="text-green-400 font-medium text-sm">✓ Vote submitted</span>
            </div>
          )}

          {isExpired && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <span className="text-red-400 font-medium text-sm">Poll has expired</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-xs">{totalVotes} total votes</span>
            <a 
              href={`/poll/${poll.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on PollMitra
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}