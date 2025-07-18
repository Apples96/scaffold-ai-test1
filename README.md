# scaffold.ai Landing Page

A modern, responsive landing page for scaffold.ai - an AI-powered process automation platform that transforms step-by-step workflow descriptions into reliable automation scaffolding.

## Features

- 🎨 **Modern Design**: Beautiful gradient backgrounds with glass morphism effects
- 📱 **Responsive**: Optimized for all devices and screen sizes
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed
- 🔥 **Firebase Integration**: Email collection with Firestore database
- 🎭 **Smooth Animations**: Framer Motion animations for enhanced UX
- 🎯 **SEO Optimized**: Meta tags and structured content for better search visibility

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd scaffold-ai-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   **Step 1: Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter your project name (e.g., "scaffold-ai")
   - Follow the setup wizard

   **Step 2: Enable Firestore**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location close to your users

   **Step 3: Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app with a nickname
   - Copy the config object

4. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Firebase configuration:
   ```env
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
scaffold-ai-landing/
├── app/
│   ├── api/
│   │   └── subscribe/
│   │       └── route.ts          # Email subscription API
│   ├── components/
│   │   └── EmailSignup.tsx       # Email signup component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main landing page
├── public/                       # Static assets
├── env.example                   # Environment variables template
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## Customization

### Colors and Branding

The design uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue gradient (`primary-500` to `primary-600`)
- **Scaffold**: Dark theme colors (`scaffold-800` to `scaffold-900`)

### Content Updates

- **Hero Section**: Edit the main headline and description in `app/page.tsx`
- **Features**: Modify the `features` array in the main component
- **Benefits**: Update the `benefits` array
- **How It Works**: Customize the `steps` array

### Styling

- **Global Styles**: Edit `app/globals.css` for custom CSS
- **Component Styles**: Use Tailwind classes or add custom CSS
- **Animations**: Modify Framer Motion animations in components

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### Other Deployment Options

- **Netlify**: Similar to Vercel, supports Next.js
- **AWS Amplify**: Full-stack deployment solution
- **Self-hosted**: Build and deploy to your own server

## Firebase Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /subscribers/{document} {
      allow write: if true;  // Allow anyone to subscribe
      allow read: if false;  // Only allow admin reads
    }
  }
}
```

## Analytics and Monitoring

Consider adding:

- **Google Analytics**: Track page views and user behavior
- **Firebase Analytics**: Monitor app performance
- **Error Tracking**: Services like Sentry for error monitoring

## Performance Optimization

The landing page is already optimized with:

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting by Next.js
- **Static Generation**: Pre-rendered pages for fast loading
- **CDN**: Vercel's global CDN for fast delivery

## Support

For questions or issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Firebase documentation](https://firebase.google.com/docs)
3. Open an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for scaffold.ai 