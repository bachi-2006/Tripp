import LandingNav from "./components/landing/LandingNav";
import Hero from "./components/landing/Hero";
import Globe from "./components/landing/Globe";
import Features from "./components/landing/Features";
import Testimonials from "./components/landing/Testimonials";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <Globe />
      <Features />
      <Testimonials />
      <Footer />
    </main>
  );
}
