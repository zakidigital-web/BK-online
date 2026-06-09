import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function verifyLogin(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: username.trim().toLowerCase() } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return {
    id: user.id,
    name: user.name,
    username: user.email,
    role: user.role,
    nipy: user.nipy,
    kelas: user.kelas,
    mapel: user.mapel,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function createUser(data: {
  name: string
  username: string
  password: string
  role?: string
  nipy?: string
  kelas?: string
  mapel?: string
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.username.trim().toLowerCase(),
      password: hashedPassword,
      role: data.role,
      nipy: data.nipy,
      kelas: data.kelas,
      mapel: data.mapel,
    },
  })
}

export function generateAnonymousId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const randomLetters = Array.from(
    { length: 4 },
    () => letters[Math.floor(Math.random() * 26)]
  ).join("")
  const randomNumbers = Math.floor(1000 + Math.random() * 9000)
  return `BK-${randomLetters}-${randomNumbers}`
}
