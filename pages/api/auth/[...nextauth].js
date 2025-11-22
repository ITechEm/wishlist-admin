import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email?.trim();
        const password = credentials.password?.trim();

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          // Log the credentials to ensure it's correct
          console.log('Authenticated:', { email, role: 'admin' });
          return { id: "1", email, name: "Admin", role: 'admin' }; // Add role
        }

        return null; // invalid credentials
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT Callback:', user); // Log the user object to verify the role
        token.role = user.role; // Add the role to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role; // Ensure role is on session
      console.log('Session Callback:', session); // Log the session object to verify role
      return session;
    },
  },
});
