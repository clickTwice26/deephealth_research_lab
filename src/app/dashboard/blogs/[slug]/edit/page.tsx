'use client';

import { useParams } from 'next/navigation';
import BlogEditor from '../../_components/BlogEditor';

export default function EditBlogPage() {
    const params = useParams();
    const slug = params.slug as string;

    return <BlogEditor slug={slug} />;
}
