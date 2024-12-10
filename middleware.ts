import { auth } from "@/app/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // Exclude '/' route from being redirected to '/login'
  if (!req.auth && pathname !== "/login" && pathname !== "/unauthorized" && pathname !== "/") {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
