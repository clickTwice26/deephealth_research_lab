import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import NewsSection from '@/components/NewsSection'
import ResearchAreasSection from '@/components/ResearchAreasSection'
import ProjectsSection from '@/components/ProjectsSection'
import PublicationsSection from '@/components/PublicationsSection'
import NewsletterSection from '@/components/NewsletterSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <NewsSection />
      <ResearchAreasSection />
      <ProjectsSection />
      <PublicationsSection />
      <NewsletterSection />
      <Footer />
    </main>
  )
}
