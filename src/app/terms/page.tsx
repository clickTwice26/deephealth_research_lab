'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <Navbar />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-grow w-full">
                <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <p>Last updated: January 1, 2026</p>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Welcome to DeepHealth Research Lab. By accessing our website and using our services, you agree to bound by these Terms and Conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Intellectual Property</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The content, features, and functionality of this site are and will remain the exclusive property of DeepHealth Research Lab and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            You are responsible for your use of the service and for any content you provide, including compliance with applicable laws, rules, and regulations.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
