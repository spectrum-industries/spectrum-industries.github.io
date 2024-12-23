
import NextAuth from "next-auth"
import Google from "next-auth/providers/google" 

const allowedEmails = ["anishsurendra7@gmail.com", "shettyyuktha2@gmail.com"];
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const userEmail = user?.email ? user.email : ""; 
      if (allowedEmails.includes(userEmail)) {
        return true;
      } else {
        return '/unauthorized';
      }
    }
  }
});
