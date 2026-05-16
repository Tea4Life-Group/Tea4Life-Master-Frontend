"use client";

import { memo } from "react";
import { motion, type Variants } from "framer-motion";
import { IntroVideo } from "./components/IntroVideo.tsx";
import { HeroCarousel } from "./components/HeroCarousel.tsx";
import { CategoriesSection } from "./components/CategoriesSection.tsx";
import { CosmicMessageSection } from "./components/CosmicMessageSection.tsx";
import { LatestNewsSection } from "./components/LatestNewsSection.tsx";

import { FloatingBackgroundObjects } from "./components/FloatingBackgroundObjects.tsx";
import { PingMeFloatingBtn } from "./components/PingMeFloatingBtn.tsx";

// Optimizing performance by memoizing static sections to prevent unnecessary repaints
const MemoizedIntroVideo = memo(IntroVideo);
const MemoizedHeroCarousel = memo(HeroCarousel);
const MemoizedCategoriesSection = memo(CategoriesSection);
const MemoizedCosmicMessageSection = memo(CosmicMessageSection);
const MemoizedLatestNewsSection = memo(LatestNewsSection);

// Framer Motion constraints for premium entrance experience
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.2, 
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.99 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a natural and professional feel
    }
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] pb-24 overflow-hidden relative selection:bg-[#1A4331] selection:text-[#F8F5F0]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Performance Hinting */
            .gpu-layer {
              will-change: transform, opacity;
              contain: paint;
            }
          `
        }}
      />

      {/* Decorative Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 gpu-layer"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating Leaves & Sparkles Background */}
      <FloatingBackgroundObjects />

      {/* PingMe Floating Cross-Promo Button */}
      <PingMeFloatingBtn />

      {/* 1. Cinematic Brand Break: Full-width Video (Hero clip) */}
      <motion.div 
        className="relative z-10 gpu-layer mb-20 md:mb-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <MemoizedIntroVideo />
      </motion.div>

      {/* Main Content Wrapper - Ordered sections */}
      <motion.main 
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32 relative z-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* 2. Hero Carousel: Primary Promos & Top Sellers (Sản phẩm nổi bật) */}
        <motion.section variants={childVariants} className="gpu-layer group">
          <MemoizedHeroCarousel />
        </motion.section>
        
        {/* 3. Cosmic Message: Random Products (Sản phẩm random) */}
        <motion.section variants={childVariants} className="gpu-layer relative">
          <MemoizedCosmicMessageSection />
        </motion.section>
        
        {/* 4. Latest News / Updates (Tin tức) */}
        <motion.section variants={childVariants} className="gpu-layer">
          <MemoizedLatestNewsSection />
        </motion.section>

        {/* 5. Categories: Quick Navigation (Danh mục sản phẩm) */}
        <motion.section variants={childVariants} className="gpu-layer">
          <MemoizedCategoriesSection />
        </motion.section>
      </motion.main>
    </div>
  );
}
