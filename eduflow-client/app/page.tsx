"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* TopNavBar */}
      <nav
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "shadow-md bg-surface/95 border-white/20 dark:border-white/10"
            : "bg-surface/80 border-transparent"
        } backdrop-blur-xl dark:bg-surface/80`}
      >
        <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
          {/* Brand */}
          <Link
            href="/"
            className="font-headline-lg text-headline-lg font-bold text-primary dark:text-inverse-primary flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined fill text-[36px] group-hover:rotate-12 transition-transform">
              school
            </span>
            EduFlow
          </Link>
          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors duration-200"
            >
              About
            </Link>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Chuyển hướng sang trang Auth */}
            <Link
              href="/login"
              className="hidden sm:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="font-label-md text-label-md bg-primary text-on-primary px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-[160px] pb-section-padding-desktop px-gutter overflow-hidden min-h-[90vh] flex items-center">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-container/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
          </div>
          <div className="max-w-container-max mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Content */}
            <div className="max-w-[800px] z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 mb-8 glass-accent">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-md text-label-md text-primary">
                  EduFlow 2.0 is live
                </span>
              </div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile lg:font-display-lg lg:text-display-lg text-on-background mb-stack-lg leading-tight">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Academic Management
                </span>{" "}
                is Here.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
                Streamline your institution with AI-powered insights, effortless
                classroom management, and seamless communication. Designed for
                the modern educator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex justify-center items-center gap-2 font-label-md text-label-md bg-primary text-on-primary px-8 py-4 rounded-full hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  Get Started for Free
                </Link>
                <button className="inline-flex justify-center items-center gap-2 font-label-md text-label-md bg-surface-container text-on-surface px-8 py-4 rounded-full hover:bg-surface-container-high transition-all duration-300">
                  Watch Demo
                </button>
              </div>
              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-4 text-on-surface-variant font-label-md text-label-md">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center overflow-hidden">
                    <img
                      alt="User 1"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbqkcsORis74EPKEHGfrs8Rl0hBECYB90MQAbe5e5vVmeqwW-IATxqBrPUHomVUPfvd3nK200sR8pz4jZNlHD3b_AE662jywAxVHeeduGjlbbUPWyayPoEP6TTTrbCUPHAeeG6XpA6kvcp9DOhPAD9Aw1Kfvn0Tl2vQ52GcqNpe3cDYXJRI7_kF75oxBLRgVdNsHukp0sNhQJNXH3HYonoFOhkSXnef8VcLcXp4cKRSXST7PTpIwEEeCXMo9G6jJzQEx_0xlEykXtO"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center overflow-hidden">
                    <img
                      alt="User 2"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-_6Ymx2h53GwYKLoNfOiUWHR816jVl051H2mnSIcUNVc6H9m5CXQQlw2Zko-G5VJaHZnOQz1zpUfrNWi3_QAyRNI4Pm4j2LopgDdQsF4PPaud71jFVFIt9VCGaOooGj0fdycPbIWvWTBcDNklbtvBBdbbwZeojn32lvaccUT7fynlNGHIy4ieJcjRMMLDcRVjDBeCyse1yDq1IJ5YuExlZ9_ns501zFvXyuYeLUqbNlgmF878E257JBTdeLtLvYcWnYh-7akvE_D4"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center overflow-hidden">
                    <img
                      alt="User 3"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS5AdB_ekKPHrxmE_5EgUawrucFsI5StU80lb-GbjdQSQmV-ANDObVLZNllYeU0ehSD5wnaVuCpTtdChh-CK4y0wlTWol7UwepqfWAuzU4DS_cm9FYTJN9Zv1wBQM10vnBvAFBUMwuo9JdQpcqZI7BVz6MeTe_fbuuTRidelpWlS5oKxrhv-6Vxt5TiWDBpR32hYaBkdTyn8Ds1AOv3mFd6Wuug_X6fXPN9jPAwvPxqrxL9aiS9sw9HiUiYAaUIwMSbe0liFZRQehm"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-xs">
                    +
                  </div>
                </div>
                <p>Trusted by 10,000+ educators</p>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative z-10 w-full h-[500px] lg:h-[700px] rounded-[32px] overflow-hidden shadow-2xl shadow-primary/20 transform hover:scale-[1.02] transition-transform duration-500 glass-accent">
              <img
                alt="EduFlow Academic Dashboard"
                className="w-full h-full object-cover absolute inset-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxU4ssPWV6wy24k3AJfFYnBMxxnYVJoJgaDRnBYAObbwBCf7saUuPB42X5qjTxBYizDPnLyUUfDHMVYOnJi6RDT1opSxkZW33Eb7K73o8ZHZ6ErO1h6myIP-fWxKXRoM7o1gdpvYtznXdJ8Jen20CCuSvhC4ZuirZr_PgP8EzoZNDXRRrwUiCIX1Dhhes3o4J6fmq68RQJeEGAeq9pFG-g2uJNcMuGkM82_NvcyEjmbD-PMs-dG3-soegJzE5QltBQyliAkIdlZ3HU"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"></div>
              {/* Floating Stats Card inside Hero Image */}
              <div className="absolute bottom-8 left-8 right-8 glass-card rounded-2xl p-6 flex justify-between items-center transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">
                    Student Engagement
                  </p>
                  <p className="font-headline-lg text-headline-lg text-on-surface">
                    +48%
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[32px]">
                    trending_up
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Strip */}
        <section className="bg-surface-container-lowest border-y border-outline-variant/20 py-12 px-gutter relative z-20">
          <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-outline-variant/20">
            <div className="text-center px-4">
              <p className="font-headline-xl text-headline-xl text-primary mb-2">
                500+
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Institutions
              </p>
            </div>
            <div className="text-center px-4">
              <p className="font-headline-xl text-headline-xl text-primary mb-2">
                10k+
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Teachers
              </p>
            </div>
            <div className="text-center px-4">
              <p className="font-headline-xl text-headline-xl text-primary mb-2">
                1M+
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Students
              </p>
            </div>
            <div className="text-center px-4">
              <p className="font-headline-xl text-headline-xl text-primary mb-2">
                99%
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Satisfaction
              </p>
            </div>
          </div>
        </section>

        {/* Features Section (Bento Grid) */}
        <section
          className="py-section-padding-desktop px-gutter relative bg-surface-container-low"
          id="features"
        >
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="font-label-md text-label-md text-primary tracking-widest uppercase mb-4 block">
                Platform Capabilities
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-background mb-4">
                Everything you need to manage education effortlessly.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                We've reimagined academic workflows from the ground up,
                combining powerful AI with intuitive design.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Feature 1: Large Card */}
              <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-[28px]">
                      psychology
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                    AI-Powered Quizzes
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                    Automatically generate assessments based on your curriculum.
                    Our AI analyzes syllabus content to create balanced,
                    comprehensive tests in seconds.
                  </p>
                </div>
                <div className="relative z-10 mt-auto flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                  <img
                    alt="3D Icons"
                    className="h-32 object-contain filter drop-shadow-xl"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_wfzzbfI5AJsciWTnB5FCOLXWzmXx70SeXgmfXYxK1sKE8dWRETZ76ak2QzB-_gxrZ-1Tu1sbMC8z2eIR8wcFlZGWWHjwkg3E4_aah7kCINV7IsARixrU0u-4R5pR29lZ0ZbCrWzyau6XF9HB6dd1prjGS_2DcqM5fqvAD0UfGHrB8L-ueFMY0gYIujXU6KKe4iVlMxcEhfyfAzD6nhRk8c0sx3TEZTCm9Q7kbe4J0nOk0YJA3tKdLlHTDnX1bBYQUuUE1ts4NCX9"
                    style={{ clipPath: "inset(0 75% 0 0)" }}
                  />
                </div>
              </div>
              {/* Feature 2: Small Card */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-secondary/50 transition-colors duration-300 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-secondary text-[28px]">
                      analytics
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-[24px] font-bold text-on-surface mb-3">
                    Detailed Analytics
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Track performance trends, identify struggling students
                    early, and optimize your teaching strategy.
                  </p>
                </div>
              </div>
              {/* Feature 3: Small Card */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-tertiary/50 transition-colors duration-300 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">
                      groups
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-[24px] font-bold text-on-surface mb-3">
                    Classroom Management
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Manage seating charts, attendance, and behavior notes in one
                    unified interface.
                  </p>
                </div>
              </div>
              {/* Feature 4: Large Card */}
              <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-primary-container/50 transition-colors duration-300 flex flex-col justify-between bg-gradient-to-br from-surface to-surface-container-high">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary-container text-[28px]">
                      schedule
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                    Time Efficiency
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                    Cut down administrative tasks by up to 15 hours a week.
                    Automated grading, bulk communication, and intuitive
                    scheduling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          className="py-section-padding-desktop px-gutter relative"
          id="pricing"
        >
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-headline-xl text-headline-xl text-on-background mb-4">
                Transparent Pricing for Every Stage
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Start free, upgrade when you need more power.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="glass-card rounded-[2rem] p-8 border border-outline-variant/30 flex flex-col">
                <h3 className="font-headline-lg text-[24px] font-bold text-on-surface mb-2">
                  Free
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Perfect for individual teachers getting started.
                </p>
                <div className="mb-8">
                  <span className="font-display-lg-mobile text-[48px] font-bold text-on-surface">
                    $0
                  </span>
                  <span className="text-on-surface-variant">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Up to 3 classes
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Basic attendance tracking
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Standard gradebook
                  </li>
                </ul>
                <button className="w-full font-label-md text-label-md bg-surface-container text-on-surface py-3 rounded-full hover:bg-surface-container-high transition-colors">
                  Start Free
                </button>
              </div>
              {/* Pro Tier */}
              <div className="glass-card rounded-[2rem] p-8 border-2 border-primary relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-primary/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary font-label-md text-[12px] uppercase tracking-wider py-1 px-4 rounded-full">
                  Most Popular
                </div>
                <h3 className="font-headline-lg text-[24px] font-bold text-on-surface mb-2">
                  Pro
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  For power educators who need advanced tools.
                </p>
                <div className="mb-8">
                  <span className="font-display-lg-mobile text-[48px] font-bold text-on-surface">
                    $12
                  </span>
                  <span className="text-on-surface-variant">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Unlimited classes
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    AI-Powered Quizzes
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Advanced Analytics Dashboard
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Priority Support
                  </li>
                </ul>
                <button className="w-full font-label-md text-label-md bg-primary text-on-primary py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200">
                  Upgrade to Pro
                </button>
              </div>
              {/* Institutional Tier */}
              <div className="glass-card rounded-[2rem] p-8 border border-outline-variant/30 flex flex-col">
                <h3 className="font-headline-lg text-[24px] font-bold text-on-surface mb-2">
                  Institutional
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Scale across entire schools or districts.
                </p>
                <div className="mb-8">
                  <span className="font-display-lg-mobile text-[48px] font-bold text-on-surface">
                    Custom
                  </span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Everything in Pro
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    SIS Integration
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Centralized Admin Controls
                  </li>
                  <li className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>
                    Dedicated Success Manager
                  </li>
                </ul>
                <button className="w-full font-label-md text-label-md bg-surface-container text-on-surface py-3 rounded-full hover:bg-surface-container-high transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-section-padding-desktop px-gutter relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary z-0"></div>
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px] z-0"></div>
          <div className="max-w-4xl mx-auto relative z-10 text-center text-on-primary">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-6 text-white">
              Ready to transform your classroom?
            </h2>
            <p className="font-body-lg text-body-lg mb-10 text-white/80 max-w-2xl mx-auto">
              Join thousands of educators who have reclaimed their time and
              boosted student engagement with EduFlow.
            </p>
            <Link
              href="/register"
              className="inline-flex justify-center items-center gap-2 font-label-md text-label-md bg-white text-primary px-10 py-5 rounded-full hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 text-[16px]"
            >
              Get Started for Free Today
              <span className="material-symbols-outlined">rocket_launch</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface dark:bg-surface-container-lowest w-full">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-container-max mx-auto border-t border-white/10 dark:border-black/10">
          <div className="mb-4 md:mb-0">
            <Link
              href="/"
              className="font-headline-lg text-headline-lg font-bold text-on-primary dark:text-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined fill text-[28px]">
                school
              </span>
              EduFlow
            </Link>
            <p className="font-body-md text-body-md text-inverse-on-surface dark:text-on-surface-variant mt-2 text-sm opacity-80">
              © 2026 EduFlow. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="#"
              className="font-body-md text-body-md text-inverse-on-surface dark:text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="font-body-md text-body-md text-inverse-on-surface dark:text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="font-body-md text-body-md text-inverse-on-surface dark:text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="#"
              className="font-body-md text-body-md text-inverse-on-surface dark:text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
            >
              Careers
            </Link>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <Link
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-on-primary hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                chat
              </span>
            </Link>
            <Link
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-on-primary hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                share
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
