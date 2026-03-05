export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/use-cases/:path*",
    "/contacts/:path*",
    "/runs/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
}
