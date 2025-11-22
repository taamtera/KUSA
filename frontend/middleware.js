import { NextResponse } from "next/server"

export function middleware(request) {
    const access = request.cookies.get("access_token")?.value
    const refresh = request.cookies.get("refresh_token")?.value

    // Only block REAL navigations, NOT prefetch requests
    const isPrefetch = request.headers.get("purpose") === "prefetch"

    if (!access && !refresh && !isPrefetch) {
        // return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    // matcher: ["/profile/:path*", "/chats/:path*", "/dashboard/:path*"],
    matcher: [],
}
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTIyMDRiMWE4NzkzMTNmYTk0YWIyZTQiLCJpYXQiOjE3NjM4MzcxNjQsImV4cCI6MTc2MzkyMzU2NH0.5CbQy3KJSxfv2QZTDd9aU_2VZJBLGHqipvf-5Etgi_I
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTIyMDRiMWE4NzkzMTNmYTk0YWIyZTQiLCJpYXQiOjE3NjM4MzcxNjQsImV4cCI6MTc2MzkyMzU2NH0.5CbQy3KJSxfv2QZTDd9aU_2VZJBLGHqipvf-5Etgi_I