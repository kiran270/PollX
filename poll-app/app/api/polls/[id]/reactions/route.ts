import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    
    const reactions = await prisma.reaction.groupBy({
      by: ['emoji'],
      where: { pollId },
      _count: {
        emoji: true
      }
    })

    return NextResponse.json(reactions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 })
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
      return NextResponse.json({ error: "Please sign in to react" }, { status: 401 })
    }

    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    // Check if user already reacted with this emoji
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_pollId_emoji: {
          userId: session.user.id,
          pollId,
          emoji
        }
      }
    })

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ removed: true })
    } else {
      // Add reaction
      const reaction = await prisma.reaction.create({
        data: {
          emoji,
          pollId,
          userId: session.user.id
        }
      })
      return NextResponse.json({ reaction, removed: false })
    }
  } catch (error) {
    console.error("Reaction error:", error)
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}
