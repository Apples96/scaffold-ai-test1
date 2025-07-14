'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Shield, 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  Play,
  Mail,
  Send,
  Sparkles,
  Workflow,
  Target,
  Clock
} from 'lucide-react'
import EmailSignup from './components/EmailSignup'

export default function Home() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Our AI understands your process descriptions and automatically generates the optimal automation scaffolding."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "High Reliability",
      description: "Built with enterprise-grade reliability and error handling to ensure your processes run smoothly."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate complete automation workflows in minutes, not days or weeks."
    },
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Seamless Integration",
      description: "Works with your existing tools and systems through our flexible API and connectors."
    }
  ]

  const benefits = [
    "Reduce manual work by 80%",
    "Eliminate human errors",
    "Scale operations instantly",
    "Focus on strategic tasks",
    "24/7 process execution",
    "Real-time monitoring & alerts"
  ]

  const steps = [
    {
      number: "01",
      title: "Describe Your Process",
      description: "Simply tell us about your step-by-step workflow in plain English."
    },
    {
      number: "02",
      title: "AI Generates Scaffolding",
      description: "Our AI analyzes your description and creates the automation framework."
    },
    {
      number: "03",
      title: "Review & Customize",
      description: "Review the generated automation and make any necessary adjustments."
    },
    {
      number: "04",
      title: "Deploy & Monitor",
      description: "Launch your automated process and monitor its performance in real-time."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-scaffold-900 via-scaffold-800 to-scaffold-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Scaffold.ai</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How it Works</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transform Your
              <span className="gradient-text block">Processes into AI</span>
              Automation
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Describe your step-by-step workflow and let our AI build the scaffolding for reliable, automated execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn-primary flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                className="btn-secondary flex items-center space-x-2"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-3xl"></div>
              <div className="relative glass-effect rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-primary-400" />
                        <span className="text-white font-medium">Input Process</span>
                      </div>
                      <p className="text-white/70 text-sm">"Extract data from emails, validate format, update CRM"</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center animate-float">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">AI Automation</span>
                      </div>
                      <p className="text-white/70 text-sm">Automated workflow with error handling & monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="gradient-text">Scaffold.ai</span>?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our AI-powered platform transforms your process descriptions into reliable, scalable automation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Get from process description to automated execution in just 4 simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="glass-effect rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Unlock Your <span className="gradient-text">Productivity</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Stop spending time on repetitive tasks. Let AI handle the heavy lifting while you focus on what matters most.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-3xl"></div>
              <div className="relative glass-effect rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-primary-400" />
                      <span className="text-white font-medium">Time Saved</span>
                    </div>
                    <span className="text-2xl font-bold gradient-text">80%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full w-4/5"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-6 h-6 text-green-400" />
                      <span className="text-white font-medium">Accuracy</span>
                    </div>
                    <span className="text-2xl font-bold gradient-text">99.9%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full w-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      <span className="text-white font-medium">Speed</span>
                    </div>
                    <span className="text-2xl font-bold gradient-text">10x</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to <span className="gradient-text">Transform</span> Your Workflows?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join the waitlist and be among the first to experience the future of process automation.
            </p>
            <EmailSignup />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Scaffold.ai</span>
            </div>
            <div className="flex items-center space-x-6 text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40">
            <p>&copy; 2024 Scaffold.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 