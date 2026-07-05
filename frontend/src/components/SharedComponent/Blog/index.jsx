import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogCard } from './BlogCard';

export const BLOG_POSTS = [
  {
    title: 'How Integer-Cents Arithmetic Eliminates Floating-Point Rounding in Ledgers',
    excerpt: 'Deep dive into deterministic finance systems and why IEEE-754 precision issues break reconciliation.',
    date: '2026-06-15T10:00:00.000Z',
    coverImage: '/images/business/business.png',
    slug: 'integer-cents-accounting',
    category: 'Engineering',
  },
  {
    title: 'Automating 3-Pass Bank-to-GL Reconciliation for Enterprise Treasury',
    excerpt: 'Architecting sub-second transaction matching across multi-currency settlement windows.',
    date: '2026-06-25T14:30:00.000Z',
    coverImage: '/images/payment/payment.png',
    slug: '3-pass-reconciliation-architecture',
    category: 'Treasury Ops',
  },
  {
    title: 'Zero-Trust Internal Controls & Segregation of Duties (SoD) in Modern Fintech',
    excerpt: 'Enforcing maker-checker protocols, real-time fraud anomaly scores, and immutable audit trails.',
    date: '2026-07-05T09:15:00.000Z',
    coverImage: '/images/hero/banner.png',
    slug: 'zero-trust-internal-controls',
    category: 'Security & Audit',
  },
];

export const Blog = ({ posts = BLOG_POSTS }) => {
  return (
    <section className="flex flex-wrap justify-center py-20 lg:py-28 bg-[#f6faff]" id="blog">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-baseline justify-between flex-wrap mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-2">
              Insights & Telemetry
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-midnight_text">
              Latest Blog & Engineering News
            </h2>
          </div>

          <Link
            to="/documentation"
            className="flex items-center gap-2 text-base font-bold text-midnight_text hover:text-primary transition-colors sm:mt-0 mt-3"
          >
            <span>View Knowledge Base</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {posts.map((blog, i) => (
            <div key={i} className="w-full">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
