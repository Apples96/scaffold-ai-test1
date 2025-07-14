import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase configuration - you'll need to replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if Firebase is configured
    if (!process.env.FIREBASE_API_KEY) {
      console.error('Firebase configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Add email to Firestore
    const docRef = await addDoc(collection(db, 'subscribers'), {
      email: email.toLowerCase().trim(),
      subscribedAt: serverTimestamp(),
      source: 'landing-page'
    })

    console.log('Email subscribed successfully:', docRef.id)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to the waitlist',
        id: docRef.id 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error subscribing email:', error)
    
    // Check if it's a duplicate email error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
} 