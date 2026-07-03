import { motion } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Work from "./components/Work";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import MouseSparkles from "./components/MouseSparkles";

const RevealSection = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true, margin: "-80px" }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ThemeProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-sans antialiased text-gray-900 dark:text-white bg-white dark:bg-gray-900"
      >
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <MouseSparkles />
        <Navbar />
        <main>
          <Hero />
          <RevealSection>
            <About />
          </RevealSection>
          <RevealSection>
            <Projects />
          </RevealSection>
          <RevealSection>
            <Work />
          </RevealSection>
          <RevealSection>
            <Testimonials />
          </RevealSection>
          <RevealSection>
            <Contact />
          </RevealSection>
        </main>
        <Footer />
      </motion.div>
    </ThemeProvider>
  );
}

export default App;
