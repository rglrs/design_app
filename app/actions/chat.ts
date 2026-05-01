"use server"

import { prisma } from '@/lib/prisma'

export async function initializeChat(guestId: string) {
  return prisma.chatSession.upsert({
    where: { guestId },
    update: {},
    create: { guestId },
  })
}

export async function sendMessage(guestId: string, content: string, sender: 'GUEST' | 'ADMIN') {
  const session = await prisma.chatSession.findUnique({
    where: { guestId }
  })

  if (!session) throw new Error('Session not found')

  return prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      content,
      sender
    }
  })
}

export async function getChatHistory(guestId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { guestId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })
  return session?.messages ?? []
}

export async function getAdminSessions() {
  const sessions = await prisma.chatSession.findMany({
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: {
              sender: 'GUEST',
              isRead: false
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
  
  return sessions.map(s => ({
    ...s,
    unreadCount: s._count.messages
  }))
}

export async function markMessagesAsRead(guestId: string, role: 'GUEST' | 'ADMIN') {
  const session = await prisma.chatSession.findUnique({ where: { guestId } })
  if (!session) return

  const senderToMark = role === 'GUEST' ? 'ADMIN' : 'GUEST'

  await prisma.chatMessage.updateMany({
    where: {
      sessionId: session.id,
      sender: senderToMark,
      isRead: false
    },
    data: {
      isRead: true
    }
  })
}

export async function getUnreadGuestCount(guestId: string) {
  const session = await prisma.chatSession.findUnique({ where: { guestId } })
  if (!session) return 0

  return prisma.chatMessage.count({
    where: {
      sessionId: session.id,
      sender: 'ADMIN',
      isRead: false
    }
  })
}