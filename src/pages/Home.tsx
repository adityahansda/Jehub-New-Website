import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Trophy,
  PenTool,
  ArrowRight,
  Star,
  Download,
  Upload,
  MessageSquare,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { stats } from "../data/mockData";

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Notes Sharing",
      description:
        "Share and access high-quality academic notes from students worldwide",
    },
    {
      icon: Users,
      title: "Community Discussions",
      description:
        "Connect with peers, ask questions, and share knowledge together",
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description:
        "Earn points for contributions and compete with fellow students",
    },
    {
      icon: PenTool,
      title: "Blog Resources",
      description:
        "Read insightful articles and study guides from top contributors",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description:
        "Join our community of students and start your academic journey",
    },
    {
      number: "02",
      title: "Upload or Request Notes",
      description:
        "Share your notes with others or request specific study materials",
    },
    {
      number: "03",
      title: "Earn Points & Help Peers",
      description: "Build your reputation by contributing valuable content",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      text: "JEHUB has been a game-changer for my studies. The notes are high-quality and the community is incredibly supportive.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Engineering Student",
      text: "I love the points system! It motivates me to share my notes and help other students succeed.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Mathematics Student",
      text: "The request feature is amazing. I can ask for specific topics and always get helpful responses.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-animated-gradient text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden h-[100vh] flex items-center justify-center">
        {/* Glowing overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Floating glowing particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute w-72 h-72 bg-pink-400 rounded-full mix-blend-overlay opacity-20 animate-pulse left-[10%] top-[20%] blur-3xl"></div>
          <div className="absolute w-80 h-80 bg-blue-400 rounded-full mix-blend-overlay opacity-20 animate-pulse right-[15%] top-[30%] blur-3xl animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bg-teal-400 rounded-full mix-blend-overlay opacity-20 animate-pulse left-[30%] bottom-[10%] blur-3xl animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-8xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Wellcome to JEHUB !
          </h1>
          <span className="text-4xl block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-6 font-bold">
            Learn, Share & Grow
          </span>
          <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Join our academic community to exchange notes, request help, and
            boost your learning journey with thousands of students worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/notes-download"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Notes
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JEHUB?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make JEHUB the best platform for
              academic collaboration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with JEHUB in just three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Join Thousands of Students
              </h2>
              <p className="text-xl text-blue-100">
                See what our community has accomplished together
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Upload className="h-8 w-8 text-yellow-300 mr-2" />
                    <span className="text-3xl sm:text-4xl font-bold">
                      {stats.notesUploaded.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-blue-100">Notes Uploaded</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-yellow-300 mr-2" />
                    <span className="text-3xl sm:text-4xl font-bold">
                      {stats.activeMembers.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-blue-100">Active Members</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-yellow-300 mr-2" />
                    <span className="text-3xl sm:text-4xl font-bold">
                      {stats.requestsFulfilled.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-blue-100">Requests Fulfilled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from our community members about their JEHUB experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Boost Your Studies?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join JEHUB today and become part of a thriving academic community
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Join JEHUB Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
