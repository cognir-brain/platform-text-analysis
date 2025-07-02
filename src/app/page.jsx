'use client'
import { FeatureCard } from "@/components/layout/feature-card";
import { TechMap } from "@/components/layout/tech-map";
import { Hero } from "@/components/layout/hero";
import { TryDemo } from "@/components/layout/try-demo";
import { EmailCard } from "@/components/layout/email-card";
import { MainNav } from "@/components/layout/main-nav";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="overflow-auto">
      <MainNav />
      <main className="space-y-20">
        <Hero />
        <TechMap />
        <FeatureCard />
        <TryDemo />
        <EmailCard />
      </main>
      <Footer />
    </div>

  );
}
