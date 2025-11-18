import { NextResponse } from "next/server";

export function middleware(request){

    const access  = request.cookies.get('access_token')?.value;
    const refresh = request.cookies.get('refresh_token')?.value;

    // No tokens -> redirect to login/home
    if (!access && !refresh) {
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/profile/:path*', '/chats/:path*', '/profile', '/chats'],
}