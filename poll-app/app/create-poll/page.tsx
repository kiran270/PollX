"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pollImage, setPollImage] = useState("")
  const [options, setOptions] = useState([{ text: "", image: "" }, { text: "", image: "" }])
  const [expiresIn, setExpiresIn] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  })
  const [category, setCategory] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [allowVoteChange, setAllowVoteChange] = useState(false)
  const [loading, setLoading] = useState(false)

  const addOption = () => {
    setOptions([...options, { text: "", image: "" }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: 'text' | 'image', value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const handleImageUpload = async (file: File, type: 'poll' | 'option', index?: number) => {
    if (!file) return

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (type === 'poll') {
        setPollImage(base64)
      } else if (type === 'option' && index !== undefined) {
        updateOption(index, 'image', base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const filteredOptions = options.filter((opt) => opt.text.trim() !== "")
    
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options")
      setLoading(false)
      return
    }

    const expiresAt = new Date(expiresIn)

    try {
      const pollData = {
        title,
        description,
        imageUrl: pollImage || null,
        options: filteredOptions.map(opt => ({
          text: opt.text,
          imageUrl: opt.image || null
        })),
        expiresAt: expiresAt.toISOString(),
        category: category || null,
        isPublic,
        allowVoteChange,
      }
      
      console.log("Sending poll data:", pollData)
      
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pollData),
      })

      if (response.ok) {
        const createdPoll = await response.json()
        
        // If it's a private poll, show the share link
        if (!isPublic) {
          const pollUrl = `${window.location.origin}/poll/${createdPoll.id}`
          const shouldCopy = confirm(
            `✅ Private poll created!\n\n` +
            `This poll is only accessible via direct link.\n\n` +
            `Share this link:\n${pollUrl}\n\n` +
            `Click OK to copy the link to clipboard.`
          )
          
          if (shouldCopy) {
            try {
              await navigator.clipboard.writeText(pollUrl)
              alert("Link copied to clipboard!")
            } catch (err) {
              // Failed to copy
            }
          }
        }
        
        router.push("/")
      } else {
        const data = await response.json()
        alert(data.details || data.error || "Failed to create poll")
      }
    } catch (error) {
      alert("Failed to create poll")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
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
          <p className="text-slate-400 mb-6">Please sign in to create polls</p>
        </div>
      </div>
    )
  }



  return (
    <div className="lg:ml-56 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Poll</h1>
          <p className="text-slate-400">Design your poll and start collecting votes</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Poll Question
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
              placeholder="What would you like to ask?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors resize-none"
              placeholder="Add more context..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
            >
              <option value="">No Category</option>
              <option value="Politics">Politics</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Technology">Technology</option>
              <option value="Science">Science</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {isPublic ? "Public Poll" : "Private Poll"}
                </label>
                <p className="text-xs text-slate-500">
                  {isPublic 
                    ? "Visible in listings and anyone can view and vote" 
                    : "Only accessible via direct link - not shown in public listings"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-blue-600" : "bg-amber-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Allow Vote Changes
                </label>
                <p className="text-xs text-slate-500">Users can change their vote before poll expires</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowVoteChange(!allowVoteChange)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowVoteChange ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowVoteChange ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Answer Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-3 items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-medium text-sm">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Optional: Image upload for this option */}
                  <div className="ml-11 flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'option', index)}
                      className="hidden"
                      id={`option-image-${index}`}
                    />
                    <label
                      htmlFor={`option-image-${index}`}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 rounded border border-slate-700 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {option.image ? 'Change Image' : 'Add Image'}
                    </label>
                    {option.image && (
                      <button
                        type="button"
                        onClick={() => updateOption(index, 'image', '')}
                        className="px-2 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {option.image && (
                    <div className="ml-11 mt-2">
                      <img src={option.image} alt={`Option ${index + 1}`} className="h-20 w-20 object-cover rounded border border-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-3 w-full px-4 py-3 border-2 border-dashed border-slate-700 text-slate-400 font-medium rounded-lg hover:border-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Option
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Poll Expiry Date & Time
            </label>
            <input
              type="datetime-local"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
