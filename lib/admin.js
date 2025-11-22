import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // your NextAuth config

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }

  return true;
}
