
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'DeepHealth Research Lab',
        short_name: 'DeepHealth',
        description: 'Advanced Research Laboratory Dashboard for Medical AI',
        start_url: '/',
        display: 'standalone',
        background_color: '#030712', // dark:bg-gray-950
        theme_color: '#2563EB', // blue-600
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png', // Ensure availability
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png', // Ensure availability
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png', // Ensure availability
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    };
}
