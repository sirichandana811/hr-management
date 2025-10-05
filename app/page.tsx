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
      {/* Top bar */}
<header className="w-full flex justify-end px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 z-50">
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
        className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 relative z-10 text-white"
        >
          WELCOME TO <span className="text-white underline">TRAILBLIZ</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 relative z-10"
        >
          Where unemployed meets unstoppable — empowering careers, fostering
          growth, and crafting professionals with world-class training,
          mentorship, and placement support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex gap-4 relative z-10"
        >
          <Link href="/auth/signin">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Why Choose Trailbliz */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-black">
            Why Choose <span className="text-gray-700">Trailbliz?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Mentorship",
                desc: "Personal guidance from experienced trainers who stay with you until you land your dream job.",
                img: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Placements",
                desc: "17,000+ students trained across leading companies.",
                img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Community",
                desc: "A supportive ecosystem of learners and mentors — built by engineers, for engineers.",
                img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
              },
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ y: -8 }}>
                <Card className="overflow-hidden border border-gray-300 hover:shadow-xl transition-all duration-300">
                  <div
                    className="h-40 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                  <CardHeader>
                    <CardTitle className="text-xl text-black">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-black text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 text-center relative z-10">
          {[
            { stat: "17K+", label: "Students Trained" },
            { stat: "100+", label: "Partner Companies" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-5xl font-extrabold">{s.stat}</h3>
              <p className="mt-2 text-lg text-gray-300">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-black">
            What Students Say
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-50 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <CardContent className="p-8">
                <p className="text-lg md:text-xl text-gray-800 italic mb-4">
                  “Trailbliz isn’t just training, it’s a career transformation.
                  The mentorship and placement prep gave me the confidence to
                  land my dream job.”
                </p>
                <footer className="text-black font-semibold">
                  — A Happy Alumni
                </footer>
              </CardContent>
            </Card>
          </motion.div>
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
