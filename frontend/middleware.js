import { NextResponse } from "next/server"

export function middleware(request){

    const login = true // wait for status from backend

    if (!login){
        return NextResponse.redirect(
            new URL('/', request.url)
        )
    }
    // console.log('middleware running')
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/chats'
    ]
}