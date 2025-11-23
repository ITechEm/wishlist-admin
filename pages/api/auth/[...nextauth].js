import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials) {
        try {
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPass = process.env.ADMIN_PASSWORD;

          if (!adminEmail || !adminPass) {
            console.error("Email sau Parolă Admin nu sunt corecte! Raport trimis!");
            return null;
          }

          if (
            credentials.email === adminEmail &&
            credentials.password === adminPass
          ) {
            return { email: credentials.email };
          }

          return null; 
        } catch (err) {
          console.error("Error in authorize:", err);
          return null;
        }
      },
    }),
  ],
});
