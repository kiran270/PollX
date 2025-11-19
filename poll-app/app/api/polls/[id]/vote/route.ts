import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: pollId } = await params
    
    if (!session?.user) {
      return NextResponse.json({ hasVoted: false })
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId,
        },
      },
    })

    return NextResponse.json({ 
      hasVoted: !!existingVote,
      optionId: existingVote?.optionId || null
    })
  } catch (error) {
    console.error("Check vote error:", error)
    return NextResponse.json({ hasVoted: false })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: pollId } = await params
    
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to vote" }, { status: 401 })
    }

    const body = await request.json()
    const { optionId } = body

    // Check if poll exists and is not expired
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (new Date() > poll.expiresAt) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 })
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId,
        },
      },
    })

    if (existingVote) {
      // If vote change is allowed, update the vote
      if (poll.allowVoteChange) {
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { optionId },
        })
        return NextResponse.json({ vote: updatedVote, changed: true })
      } else {
        return NextResponse.json({ error: "You have already voted on this poll" }, { status: 400 })
      }
    }

    // Create new vote
    const vote = await prisma.vote.create({
      data: {
        userId: session.user.id,
        pollId,
        optionId,
      },
    })

    return NextResponse.json({ vote, changed: false })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
