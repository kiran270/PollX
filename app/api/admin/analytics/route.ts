import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalPolls = await prisma.poll.count()
    const totalVotes = await prisma.vote.count()
    const totalOptions = await prisma.option.count()

    // Get active vs expired polls
    const now = new Date()
    const activePolls = await prisma.poll.count({
      where: { expiresAt: { gt: now } },
    })
    const expiredPolls = await prisma.poll.count({
      where: { expiresAt: { lte: now } },
    })

    // Get user role distribution
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    })
    const memberCount = await prisma.user.count({
      where: { role: "MEMBER" },
    })

    // Get most voted polls
    const mostVotedPolls = await prisma.poll.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
      take: 5,
    })

    // Get recent activity
    const recentVotes = await prisma.vote.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        poll: {
          select: { title: true },
        },
        option: {
          select: { text: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Get polls created per day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const pollsPerDay = await prisma.poll.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    })

    // Get votes per day (last 7 days)
    const votesPerDay = await prisma.vote.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPolls,
        totalVotes,
        totalOptions,
        activePolls,
        expiredPolls,
        adminCount,
        memberCount,
      },
      mostVotedPolls: mostVotedPolls.map(poll => ({
        id: poll.id,
        title: poll.title,
        voteCount: poll._count.votes,
        expiresAt: poll.expiresAt,
      })),
      recentActivity: recentVotes.map(vote => ({
        id: vote.id,
        userName: vote.user?.name || 'Anonymous',
        pollTitle: vote.poll.title,
        optionText: vote.option.text,
        createdAt: vote.createdAt,
      })),
      pollsPerDay: pollsPerDay.length,
      votesPerDay: votesPerDay.length,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
