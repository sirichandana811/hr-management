"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Top Bar */}
      <header className="w-full flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 z-50">
      
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-black tracking-tight">
  <img
    src="/logo.jpg"
    alt="Trailbliz Logo"
    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-lg"
  />
  Trailbliz <span className="text-gray-600">(Nirudhyog)</span>
</h1>

        <div className="flex items-center gap-4">
          <Link href="/review">
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              Give Feedback
            </Button>
          </Link>
          <Link href="/anonymousfeedback">
            <Button
              size="sm"
              className="bg-gray-200 text-black hover:bg-gray-300 border border-gray-400"
            >
              Anonymous Feedback
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:"",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 relative z-10 text-white drop-shadow-lg"
        >
          Empowering <span className="text-yellow-400 underline">Careers</span>,
          Building <span className="text-yellow-400 underline">Futures</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 relative z-10"
        >
          Trailbliz transforms the unemployed into unstoppable professionals
          through world-class mentorship, career guidance, and job placement
          support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex gap-4 relative z-10"
        >
          <Link href="/auth/signin">
            <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500">
              Sign In
            </Button>
          </Link>
          <Link href="#about">
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
              Learn More
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/Trailbliz.jpg"
            alt="About Trailbliz"
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h2 className="text-3xl font-bold mb-6 text-black">
              Who We Are
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Trailbliz (Nirudhyog) is a skill development and career acceleration platform dedicated to transforming passionate learners into job-ready professionals. Our ecosystem combines mentorship, real-world projects, and job placement support.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We partner with top organizations and industry experts to ensure that every learner achieves career excellence — regardless of their background.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12 text-black">
          Our <span className="text-yellow-500">Mission & Vision</span>
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <Card className="border-yellow-400 shadow-md hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-black">
                🎯 Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg">
                To bridge the gap between education and employability by empowering students with real-world skills, confidence, and the right mindset for success.
              </p>
            </CardContent>
          </Card>
          <Card className="border-yellow-400 shadow-md hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-black">
                🚀 Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg">
                To create a future where every graduate becomes a confident, capable, and employable professional contributing to India’s growing tech revolution.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-black">
            Explore Our <span className="text-yellow-500">Programs</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Full Stack Development",
                desc: "Master MERN Stack and become a job-ready developer with hands-on projects.",
                img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Data Analytics",
                desc: "Learn to analyze, visualize, and interpret data using Python, Excel, and Power BI.",
                img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Interview & Career Prep",
                desc: "Enhance your soft skills, resume, and interview techniques with expert mentorship.",
                img: "https://images.unsplash.com/photo-1581093588401-22d5d1c571b1?auto=format&fit=crop&w=600&q=80",
              },
            ].map((p) => (
              <motion.div key={p.title} whileHover={{ y: -8 }}>
                <Card className="overflow-hidden border border-gray-300 hover:shadow-xl transition-all duration-300">
                  <div
                    className="h-48 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
                    style={{ backgroundImage: `url(${p.img})` }}
                  />
                  <CardHeader>
                    <CardTitle className="text-xl text-black">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-black text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center relative z-10">
          {[
            { stat: "17K+", label: "Students Trained" },
            { stat: "100+", label: "Partner Companies" },
            { stat: "95%", label: "Placement Success Rate" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-5xl font-extrabold text-yellow-400">{s.stat}</h3>
              <p className="mt-2 text-lg text-gray-300">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-black">
            Hear From Our <span className="text-yellow-500">Learners</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                text: "Trailbliz changed my life! I went from being unsure about my career to landing my first developer job within 3 months.",
                name: "Priya Sharma",
                role: "Software Engineer at Accenture",
              },
              {
                text: "The mentors guided me throughout — from resume building to cracking my interviews. Truly grateful!",
                name: "Rohit Verma",
                role: "Data Analyst at Deloitte",
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 hover:shadow-lg transition"
              >
                <p className="text-lg text-gray-800 italic mb-4">“{t.text}”</p>
                <footer className="text-black font-semibold">
                  — {t.name}, <span className="text-gray-600">{t.role}</span>
                </footer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6">
          <p>
            © {new Date().getFullYear()} Trailbliz (Nirudhyog). All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="mailto:contact@nirudhyog.com"
              className="hover:text-white transition-colors"
            >
              contact@nirudhyog.com
            </a>
            <a
              href="tel:+918121398942"
              className="hover:text-white transition-colors"
            >
              +91 81213 98942
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
