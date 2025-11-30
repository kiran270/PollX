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
  expiresAt: string
  userId: string
  options: Option[]
  _count: {
    votes: number
    comments: number
  }
}

export default function PollCard({ poll: initialPoll }: { poll: Poll }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [poll, setPoll] = useState<Poll>(initialPoll)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [userVotedOption, setUserVotedOption] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isExpired, setIsExpired] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Check if user has already voted - need to fetch from API
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const response = await fetch(`/api/polls/${poll.id}/vote`)
        if (response.ok) {
          const data = await response.json()
          setHasVoted(data.hasVoted)
          if (data.hasVoted && data.optionId) {
            setUserVotedOption(data.optionId)
          }
        }
      } catch (error) {
        console.error("Failed to check vote status:", error)
      }
    }
    checkVoteStatus()
  }, [poll.id])

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
        setUserVotedOption(selectedOption)
        
        // Fetch updated poll data to show new vote counts
        const pollResponse = await fetch(`/api/polls/${poll.id}`)
        if (pollResponse.ok) {
          const updatedPoll = await pollResponse.json()
          setPoll(updatedPoll)
        }
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
      if (opt._count.votes > maxVotes) {
        maxVotes = opt._count.votes
        leadingId = opt.id
      }
    })
    return leadingId
  }

  const leadingOptionId = getLeadingOption()
  const isOwner = session?.user?.id === poll.userId

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

  const handleShare = async () => {
    // Prevent multiple simultaneous share attempts
    if (isSharing) return
    
    setIsSharing(true)
    const url = `${window.location.origin}/poll/${poll.id}`
    
    try {
      if (navigator.share) {
        // Use native share if available (mobile)
        await navigator.share({
          title: poll.title,
          text: poll.description || `Vote on: ${poll.title}`,
          url: url,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url)
        alert('Poll link copied to clipboard!')
      }
    } catch (error: any) {
      // Ignore AbortError (user cancelled share dialog)
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        // Try clipboard as fallback if native share fails
        try {
          await navigator.clipboard.writeText(url)
          alert('Poll link copied to clipboard!')
        } catch (clipboardError) {
          console.error('Failed to copy:', clipboardError)
          alert('Failed to share. Link: ' + url)
        }
      }
    } finally {
      // Reset sharing state after a short delay
      setTimeout(() => setIsSharing(false), 1000)
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 card-hover">
      {poll.imageUrl && (
        <div className="mb-4 -mx-6 -mt-6">
          <img 
            src={poll.imageUrl} 
            alt={poll.title} 
            className="w-full h-48 object-cover rounded-t-xl"
          />
        </div>
      )}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 hover:text-blue-400 cursor-pointer" onClick={() => router.push(`/poll/${poll.id}`)}>
            {poll.title}
          </h3>
          {poll.description && (
            <p className="text-sm text-slate-400">{poll.description}</p>
          )}
          {poll.category && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
              {poll.category}
            </span>
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

          <div className="flex gap-1">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`p-1.5 rounded-lg transition-colors ${
                isSharing 
                  ? "text-slate-600 cursor-not-allowed" 
                  : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
              }`}
              title={isSharing ? "Sharing..." : "Share poll"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {isOwner && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        {poll.options
          .sort((a, b) => b._count.votes - a._count.votes)
          .map((option) => {
          const voteCount = option._count.votes
          const percentage = getPercentage(voteCount)
          const isSelected = selectedOption === option.id
          const isLeading = option.id === leadingOptionId && totalVotes > 0
          const isUserVoted = hasVoted && userVotedOption === option.id

          return (
            <div key={option.id} className="relative">
              {isLeading && totalVotes > 0 && (
                <div className="absolute -top-1 -right-1 bg-[#E31E24] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10 shadow-lg">
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

                <div 
                  className={`relative overflow-hidden rounded-lg transition-all bg-slate-800/50 ${
                    isUserVoted
                      ? "border-2"
                      : isSelected
                      ? "border border-blue-500 bg-blue-500/10"
                      : "border border-slate-700 hover:border-slate-600"
                  }`}
                  style={isUserVoted ? { borderColor: '#E31E24' } : {}}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[#E31E24] opacity-40 transition-all duration-500 z-0"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 flex-1">
                      {option.imageUrl && (
                        <img 
                          src={option.imageUrl} 
                          alt={option.text} 
                          className="w-12 h-12 object-cover rounded border border-slate-700"
                        />
                      )}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isUserVoted
                          ? "border-[#E31E24] bg-[#E31E24]"
                          : isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-600 bg-transparent"
                        }`}>
                        {(isSelected || isUserVoted) && (
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
        <div className="p-3 bg-[#E31E24]/10 border border-[#E31E24]/20 rounded-lg text-center">
          <span className="text-[#E31E24] font-medium text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Vote submitted
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>{totalVotes} total votes</span>
        <button
          onClick={() => router.push(`/poll/${poll.id}`)}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {poll._count.comments} comments
        </button>
      </div>
    </div>
  )
}
