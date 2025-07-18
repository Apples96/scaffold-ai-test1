'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Clock, BarChart3, Users, CheckCircle, ChevronRight } from 'lucide-react'
import EmailSignup from './components/EmailSignup'
import WorkflowGenerator from './components/WorkflowGenerator'
import LightOnLogoImage from './components/LightOnLogoImage'

export default function Home() {
  const scrollToWorkflowGenerator = () => {
    const element = document.getElementById('workflow-generator');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <LightOnLogoImage size={32} />
              <h1 className="text-xl font-bold text-gradient">LightOn scaffold.ai</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How it Works</a>
              <a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding pt-32">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="text-gradient block">Processes into AI</span>
              Automation
            </h1>
            {/* Hero description */}
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-4xl mx-auto leading-relaxed">
              Describe your step-by-step workflow and let our AI build the scaffolding for reliable, automated execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button 
                onClick={scrollToWorkflowGenerator}
                className="btn-primary text-base px-7 py-2.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-none hover:shadow-md transition-all group"
              >
                <span>Get Started Free</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button 
                onClick={scrollToWorkflowGenerator}
                className="btn-secondary text-base px-7 py-3 rounded-lg font-semibold flex items-center gap-2 border border-white/20 hover:border-white/40 transition-all"
              >
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="workflow-generator">
        <WorkflowGenerator />
      </section>

      {/* Process Flow */}
      <section className="section-padding bg-white/5">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                From Process Description to
                <span className="text-gradient block">Automated Execution</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Simply describe your workflow in plain English. Our AI analyzes your process and generates the complete automation framework with error handling and monitoring.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white/90">Natural language processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white/90">Automatic error handling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white/90">Real-time monitoring</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/10">
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="font-semibold mb-2">Input Process</h3>
                    <p className="text-white/70 text-sm">"Extract data from emails, validate format, update CRM"</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-white/50" />
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="font-semibold mb-2">AI Automation</h3>
                    <p className="text-white/70 text-sm">Automated workflow with error handling & monitoring</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-gradient">LightOn scaffold.ai</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our AI-powered platform transforms your process descriptions into reliable, scalable automation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-Powered Analysis",
                description: "Our AI understands your process descriptions and automatically generates the optimal automation scaffolding."
              },
              {
                icon: Shield,
                title: "High Reliability",
                description: "Built with enterprise-grade reliability and error handling to ensure your processes run smoothly."
              },
              {
                icon: Clock,
                title: "Lightning Fast",
                description: "Generate complete automation workflows in minutes, not days or weeks."
              },
              {
                icon: BarChart3,
                title: "Seamless Integration",
                description: "Works with your existing tools and systems through our flexible API and connectors."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <feature.icon className="h-12 w-12 text-gradient mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-white/5">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Get from process description to automated execution in just 4 simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
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
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <span className="text-2xl font-bold text-gradient">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unlock Your <span className="text-gradient">Productivity</span>
              </h2>
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                Stop spending time on repetitive tasks. Let AI handle the heavy lifting while you focus on what matters most.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Time Saved", value: "80%" },
                  { label: "Accuracy", value: "99.9%" },
                  { label: "Speed", value: "10x" },
                  { label: "Efficiency", value: "24/7" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                "Reduce manual work by 80%",
                "Eliminate human errors",
                "Scale operations instantly",
                "Focus on strategic tasks",
                "24/7 process execution",
                "Real-time monitoring & alerts"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section id="contact" className="section-padding bg-white/5">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your <span className="text-gradient">Workflows</span>?
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto">
              Join the waitlist and be among the first to experience the future of process automation.
            </p>
            <EmailSignup />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <LightOnLogoImage size={28} />
              <h3 className="text-xl font-bold text-gradient">LightOn scaffold.ai</h3>
            </div>
            <div className="flex space-x-8 text-sm text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            © 2024 LightOn scaffold.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 