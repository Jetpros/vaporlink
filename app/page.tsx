import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Lock, Users, Clock, Image, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="vapor-particle absolute w-64 h-64 bg-purple-200/30 rounded-full blur-3xl top-20 left-20" />
        <div className="vapor-particle absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl bottom-20 right-20" />
        <div className="vapor-particle absolute w-80 h-80 bg-blue-200/30 rounded-full blur-3xl top-1/2 left-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">VaporLink</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition">
              Sign In
            </Link>
            <Link href="/create">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Create Link
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-gray-900 animate-float">
            Share a link.<br />
            Chat for 24 hours.<br />
            Vanish forever.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Instant, private, time-bound group chats. No signup required to join.
            Create a room in 3 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6">
                <Zap className="w-5 h-5 mr-2" />
                Create Link Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-indigo-300 text-gray-700 text-lg px-8 py-6 hover:bg-indigo-50">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="No Signup to Join"
            description="Recipients need zero setup. Just click, chat, and go."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Password Protected"
            description="Optional passwords keep your conversations secure."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="10 Participants Max"
            description="Perfect size for focused group conversations."
          />
          <FeatureCard
            icon={<Image className="w-8 h-8" />}
            title="Rich Media Support"
            description="Share files, images, videos, and voice messages."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Real-time Everything"
            description="Typing indicators, online status, instant delivery."
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="Auto-Delete in 24h"
            description="All messages and files vanish automatically. No trace."
          />
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-12 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Ready to disappear?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Create your first ephemeral chat room in seconds. No account needed.
            </p>
            <Link href="/create">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-12 py-6">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 mt-32 py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-4">
            Open source • MIT License • Made with 💜
          </p>
          <div className="flex justify-center space-x-6">
            <a href="https://github.com" className="hover:text-indigo-600 transition">
              GitHub
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Docs
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
