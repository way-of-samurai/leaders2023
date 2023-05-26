import * as jose from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './db'

export function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function issueToken(userId) {
  return await new jose
    .SignJWT({ userId: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret())
}

export async function verifyToken(token) {
  const { payload } = await jose.jwtVerify(token, secret())
  return payload.userId
}

export async function signIn(userId) {
  const token = await issueToken(userId)
  cookies().set("token", token)
}

export async function currentUserId() {
  const token = cookies().get("token")?.value
  if (!token) return null

  try {
    return await verifyToken(token)
  } catch(err) {
    return null
  }
}

export async function currentUser() {
  const userId = await currentUserId()
  if (!userId) return null

  return prisma.user.findUnique({ where: { id: userId } })
}

export async function isAuthenticated() {
  const user = await currentUser()
  return user != null
}

export async function isUnauthenticated() {
  return !(await isAuthenticated())
}
