import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import NewsSection from '@/components/NewsSection'
import ResearchAreasSection from '@/components/ResearchAreasSection'
import ProjectsSection from '@/components/ProjectsSection'
import PublicationsSection from '@/components/PublicationsSection'
import OpenRolesSection from '@/components/OpenRolesSection'
import NewsletterSection from '@/components/NewsletterSection'
import Footer from '@/components/Footer'
import TargetCursor from '@/components/TargetCursor'

export default function Home() {
  return (
    <main className="min-h-screen">
      <TargetCursor
        targetSelector="a, button, input, .cursor-target"
        hideDefaultCursor={true}
        spinDuration={4}
      />
      <Navbar />
      <Hero />
      <NewsSection />
      <ResearchAreasSection />
      <ProjectsSection />
      <PublicationsSection />
      <OpenRolesSection />
      <NewsletterSection />
      <Footer />
    </main>
  )
}
