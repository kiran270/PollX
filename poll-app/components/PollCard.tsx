"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Vote {
  id: string
  userId: string
  pollId: string
  optionId: string
}

interface Option {
  id: string
  text: string
  votes: Vote[]
}

interface Poll {
  id: string
  title: string
  description: string | null
  expiresAt: string
  options: Option[]
  _count: {
    votes: number
  }
}

export default function PollCard({ poll }: { poll: Poll }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  // Check if user has already voted
  useEffect(() => {
    if (session?.user?.id) {
      const userVoted = poll.options.some(option =>
        option.votes.some(vote => vote.userId === session.user.id)
      )
      setHasVoted(userVoted)
    }
  }, [session, poll.options])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(poll.expiresAt).getTime()
      const distance = expiry - now

      if (distance < 0) {
        setIsExpired(true)
        setTimeRemaining("Expired")
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [poll.expiresAt])

  const handleVote = async () => {
    if (!selectedOption) return

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      if (response.ok) {
        setHasVoted(true)
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const data = await response.json()
        if (response.status === 401) {
          alert("Please sign in to vote")
        } else {
          alert(data.error)
        }
      }
    } catch (error) {
      alert("Failed to submit vote")
    }
  }

  const totalVotes = poll._count.votes
  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  }

  const getLeadingOption = () => {
    let maxVotes = 0
    let leadingId = ""
    poll.options.forEach(opt => {
      if (opt.votes.length > maxVotes) {
        maxVotes = opt.votes.length
        leadingId = opt.id
      }
    })
    return leadingId
  }

  const leadingOptionId = getLeadingOption()
  const isAdmin = session?.user?.role === "admin"

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return
    }

    console.log("Deleting poll with ID:", poll.id, "type:", typeof poll.id)

    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: "DELETE",
      })

      console.log("Delete response status:", response.status)

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        console.error("Delete error response:", data)
        alert(data.error || "Failed to delete poll")
      }
    } catch (error) {
      console.error("Delete request failed:", error)
      alert("Failed to delete poll")
    }
  }

  const handleEdit = () => {
    router.push(`/edit-poll/${poll.id}`)
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 card-hover">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{poll.title}</h3>
          {poll.description && (
            <p className="text-sm text-slate-400">{poll.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isExpired
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-red-500" : "bg-green-500"}`}></div>
            {timeRemaining}
          </div>

          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={handleEdit}
                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Edit poll"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete poll"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        {poll.options.map((option, index) => {
          const voteCount = option.votes.length
          const percentage = getPercentage(voteCount)
          const isSelected = selectedOption === option.id
          const isLeading = option.id === leadingOptionId && totalVotes > 0

          return (
            <div key={option.id} className="relative">
              {isLeading && totalVotes > 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-md z-10">
                  Leading
                </div>
              )}

              <label className={`relative block cursor-pointer ${hasVoted || isExpired ? "cursor-not-allowed" : ""}`}>
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={hasVoted || isExpired}
                  className="sr-only"
                />

                <div className={`relative overflow-hidden rounded-lg border transition-all ${isSelected
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                  }`}>
                  <div
                    className="absolute inset-0 bg-blue-500/10 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-600 bg-transparent"
                        }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {option.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-400">
                        {voteCount}
                      </span>
                      <span className="text-base font-bold text-blue-400 min-w-[45px] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )
        })}
      </div>

      {!hasVoted && !isExpired && (
        <button
          onClick={handleVote}
          disabled={!selectedOption}
          className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          Submit Vote
        </button>
      )}

      {hasVoted && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          <span className="text-green-400 font-medium text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Vote submitted
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>{totalVotes} total votes</span>
      </div>
    </div>
  )
}
