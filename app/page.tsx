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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-100 via-transparent to-transparent blur-3xl opacity-40" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 relative z-10"
        >
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            WELCOME TO TRAILBLIZ
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 relative z-10"
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
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Why Choose <span className="text-indigo-600">Trailbliz?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Mentorship",
                desc: "Personal guidance from experienced trainers who stay with you until you land your dream job.",
              },
              {
                title: "Placements",
                desc: "17,000+ students trained across leading companies.",
              },
              {
                title: "Community",
                desc: "A supportive ecosystem of learners and mentors — built by engineers, for engineers.",
              },
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ y: -8 }}>
                <Card className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-700">
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

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
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
              <h3 className="text-5xl font-bold">{s.stat}</h3>
              <p className="mt-2 text-lg text-indigo-100">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            What Students Say
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-indigo-50 border border-indigo-100 shadow-sm">
              <CardContent className="p-8">
                <p className="text-lg md:text-xl text-gray-700 italic mb-4">
                  “Trailbliz isn’t just training, it’s a career transformation.
                  The mentorship and placement prep gave me the confidence to
                  land my dream job.”
                </p>
                <footer className="text-indigo-700 font-semibold">
                  — A Happy Alumni
                </footer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
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
