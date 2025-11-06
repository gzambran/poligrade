import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const sitePassword = process.env.SITE_PASSWORD

    // Debug logging
    console.log('Received password length:', password?.length)
    console.log('Expected password length:', sitePassword?.length)
    console.log('Passwords match:', password === sitePassword)

    // If no password is set, allow access (development mode)
    if (!sitePassword) {
      console.log('No SITE_PASSWORD set, allowing access')
      return NextResponse.json({ success: true })
    }

    // Check if password matches
    if (password === sitePassword) {
      // Create response with success
      const response = NextResponse.json({ success: true })

      // Set authentication cookie (expires in 30 days)
      response.cookies.set('site_auth', sitePassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return response
    }

    // Password incorrect
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
