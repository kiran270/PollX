import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to vote" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { optionId } = body

    const poll = await prisma.poll.findUnique({
      where: { id },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (new Date() > poll.expiresAt) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 })
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId: id,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 })
    }

    const vote = await prisma.vote.create({
      data: {
        userId: session.user.id,
        pollId: id,
        optionId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
