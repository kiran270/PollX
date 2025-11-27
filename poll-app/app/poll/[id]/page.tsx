"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Head from "next/head"
import PollResults from "@/components/PollResults"

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    name: string
    image: string | null
  }
}

export default function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [poll, setPoll] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<string>("")
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    fetchPoll()
    fetchComments()
  }, [id])

  const fetchPoll = async () => {
    try {
      const res = await fetch(`/api/polls/${id}`)
      const data = await res.json()
      setPoll(data)
      
      if (session?.user?.id) {
        // Check vote status via API
        const voteRes = await fetch(`/api/polls/${id}/vote`)
        const voteData = await voteRes.json()
        setHasVoted(voteData.hasVoted)
        
        if (voteData.hasVoted && voteData.optionId) {
          setUserVote(voteData.optionId)
        }
      }
    } catch (error) {
      console.error("Failed to fetch poll:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/polls/${id}/comments`)
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const handleVote = async () => {
    if (!selectedOption) return

    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.changed) {
          alert("Your vote has been changed!")
        }
        setHasVoted(true)
        setUserVote(selectedOption)
        fetchPoll()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to submit vote")
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const response = await fetch(`/api/polls/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      })

      if (response.ok) {
        setCommentText("")
        fetchComments()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to post comment")
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Check out this poll: ${poll?.title}`
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
      setShowShareMenu(false)
      return
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400")
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center">
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
    <>
      <Head>
        <title>{poll.title} - PollApp</title>
        <meta name="description" content={poll.description || `Vote on: ${poll.title}`} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.description || `Vote on: ${poll.title}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={poll.title} />
        <meta name="twitter:description" content={poll.description || `Vote on: ${poll.title}`} />
      </Head>
      <div className="lg:ml-64 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-slate-400 hover:text-white flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{poll.title}</h1>
              {poll.description && (
                <p className="text-slate-400">{poll.description}</p>
              )}
              {poll.category && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/20">
                  {poll.category}
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {poll?.userId === session?.user?.id && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/polls/${id}/results`, { method: 'POST' })
                      if (res.ok) {
                        const blob = await res.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `poll-results-${id}-${Date.now()}.csv`
                        document.body.appendChild(a)
                        a.click()
                        setTimeout(() => {
                          window.URL.revokeObjectURL(url)
                          document.body.removeChild(a)
                        }, 100)
                        alert('✅ CSV downloaded!')
                      } else {
                        const error = await res.json()
                        alert(`❌ ${error.error}`)
                      }
                    } catch (error) {
                      alert('❌ Download failed')
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title="Download Results (CSV)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download CSV</span>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-10">
                    <button onClick={() => handleShare("twitter")} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-t-lg">Twitter</button>
                    <button onClick={() => handleShare("facebook")} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700">Facebook</button>
                    <button onClick={() => handleShare("linkedin")} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700">LinkedIn</button>
                    <button onClick={() => handleShare("whatsapp")} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700">WhatsApp</button>
                    <button onClick={() => handleShare("copy")} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-b-lg">Copy Link</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {poll.options
              .sort((a: any, b: any) => b._count.votes - a._count.votes)
              .map((option: any) => {
              const voteCount = option._count.votes
              const percentage = getPercentage(voteCount)
              const isSelected = selectedOption === option.id
              const isUserVote = userVote === option.id

              return (
                <div key={option.id} className="relative">
                  <label className={`relative block ${hasVoted || isExpired ? "" : "cursor-pointer"}`}>
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={isSelected || isUserVote}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={(!poll.allowVoteChange && hasVoted) || isExpired}
                      className="sr-only"
                    />
                    <div className={`relative overflow-hidden rounded-lg border transition-all ${
                      isSelected || isUserVote ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50"
                    }`}>
                      <div className="absolute inset-0 bg-blue-500/10" style={{ width: `${percentage}%` }} />
                      <div className="relative flex items-center justify-between p-4">
                        <span className="text-white font-medium">{option.text}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{voteCount} votes</span>
                          <span className="text-blue-400 font-bold">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          {!hasVoted && !isExpired && session && (
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              Submit Vote
            </button>
          )}

          {hasVoted && poll.allowVoteChange && !isExpired && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || selectedOption === userVote}
              className="w-full px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              Change Vote
            </button>
          )}

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
            <span>{totalVotes} total votes</span>
            <span>{comments.length} comments</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
          
          {session ? (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white resize-none mb-3"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className="text-slate-400 mb-6">Sign in to comment</p>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-slate-800 rounded-lg">
                  <div className="flex-shrink-0">
                    {comment.user.image ? (
                      <img src={comment.user.image} alt={comment.user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{comment.user.name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Poll Results - Only visible to poll owner */}
          <PollResults 
            pollId={id} 
            isOwner={poll?.userId === session?.user?.id} 
          />
        </div>
      </div>
    </div>
    </>
  )
}
