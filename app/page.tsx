"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// A simple star icon component
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);


export default function HomePage() {
  const programs = [
    {
      title: "Full Stack Development",
      desc: "Master MERN Stack and become a job-ready developer with hands-on projects.",
      img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Data Analytics",
      desc: "Learn to analyze, visualize, and interpret data using Python, Excel, and Power BI.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Interview & Career Prep",
      desc: "Enhance your soft skills, resume, and interview techniques with expert mentorship.",
      img: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const stats = [
    { stat: "17K+", label: "Students Trained" },
    { stat: "100+", label: "Partner Companies" },
    { stat: "95%", label: "Placement Success Rate" },
  ];

  const testimonials = [
    {
      name: "Sai Kumar",
      quote: "The mentors at Trailbliz are exceptional. They provided personalized guidance that helped me crack interviews at top tech companies. The hands-on projects were a game-changer.",
      avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=SK",
    },
    {
      name: "Priya Sharma",
      quote: "I was struggling to find a job after graduation. Trailbliz's career prep program transformed my confidence and skills. I landed my dream job within three months!",
      avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=PS",
    },
    {
      name: "Anjali Reddy",
      quote: "The data analytics course was incredibly comprehensive. The instructors made complex topics easy to understand, and the placement support was outstanding.",
      avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=AR",
    },
  ];

  const companyLogos = [
    { name: "TCS", url: "" },
    { name: "Wipro", url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
    { name: "Infosys", url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
    { name: "Capgemini", url: "https://upload.wikimedia.org/wikipedia/commons/5/56/Capgemini_logo_2017.svg" },
    { name: "Accenture", url: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
    { name: "Deloitte", url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/DeloitteNewLogo.svg" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      {/* Top Bar */}
      <header className="w-full flex justify-between items-center px-4 sm:px-8 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 z-50">
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-black tracking-tight">
          <img
            src="/logo.jpg"
            alt="Trailbliz Logo"
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-lg"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/000000/FFFFFF?text=T'; }}
          />
          TrailblizOne
        </h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <a href="/review">
            <Button size="sm" className="bg-black text-white hover:bg-gray-800 transition-colors">
              Give Feedback
            </Button>
          </a>
          <a href="/anonymousfeedback">
            <Button
              size="sm"
              className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300 transition-colors"
            >
              Anonymous
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gray-50 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6">
              <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center md:text-left"
              >
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-black tracking-tight">
                      Launch Your Tech Career with Confidence
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10">
                    Trailbliz transforms unemployed graduates into unstoppable professionals through world-class mentorship, career guidance, and job placement support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <a href="/auth/signin">
                          <Button size="lg" className="w-full sm:w-auto bg-yellow-400 text-black hover:bg-yellow-500 transition-transform hover:scale-105 shadow-md">
                              Get Started
                          </Button>
                      </a>
                      <a href="#about">
                          <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-400 text-black hover:bg-gray-100 transition-transform hover:scale-105">
                              Learn More
                          </Button>
                      </a>
                  </div>
              </motion.div>
              <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="hidden md:block"
              >
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Students collaborating" className="rounded-2xl shadow-2xl object-cover"/>
              </motion.div>
          </div>
      </section>


      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.img
            src="/Trailbliz.jpg"
            alt="About Trailbliz"
            className="rounded-2xl shadow-lg w-full h-auto"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=About+Us'; }}
          />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-black">
              Who We Are
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Trailbliz (Nirudhyog) is a skill development and career acceleration platform dedicated to transforming passionate learners into job-ready professionals. Our ecosystem combines mentorship, real-world projects, and placement support.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We partner with top organizations and industry experts to ensure that every learner achieves career excellence — regardless of their background.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12 text-black">
          Our <span className="text-yellow-500">Mission & Vision</span>
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <Card className="border-yellow-400 shadow-md hover:shadow-xl transition-shadow duration-300">
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
          <Card className="border-yellow-400 shadow-md hover:shadow-xl transition-shadow duration-300">
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

      {/* Programs */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-black">
            Explore Our <span className="text-yellow-500">Programs</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.map((p, index) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full"
              >
                <Card className="overflow-hidden h-full flex flex-col border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.img})` }}
                  />
                  <CardHeader>
                    <CardTitle className="text-xl text-black">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-left">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-black">
            What Our <span className="text-yellow-500">Students Say</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 text-left border border-gray-200 shadow-lg hover:border-yellow-400 transition-colors">
                  <CardContent className="p-0 flex flex-col items-start">
                    <div className="flex text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5"/>)}
                    </div>
                    <p className="text-gray-600 mb-6 flex-grow">"{t.quote}"</p>
                    <div className="flex items-center">
                      <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4 bg-gray-200" />
                      <div>
                        <p className="font-semibold text-black">{t.name}</p>
                        <p className="text-sm text-gray-500">Trailbliz Graduate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Stats */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-12 text-center">
          {stats.map((s) => (
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

      {/* Company Logos Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-12">
            Our Graduates are Hired by Top Companies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {companyLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex justify-center"
              >
                <img 
                  src={logo.url} 
                  alt={logo.name} 
                  className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6 text-center md:text-left">
          <p>
            © {new Date().getFullYear()} Trailbliz (Nirudhyog). All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a href="mailto:contact@nirudhyog.com" className="hover:text-white transition-colors">
              contact@nirudhyog.com
            </a>
            <a href="tel:+918121398942" className="hover:text-white transition-colors">
              +91 81213 98942
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

