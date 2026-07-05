import React from "react";
import { Link } from "react-router-dom";

export const BlogCard = ({ blog = {} }) => {
  const {
    title = "Reconciliation & Treasury Ledger Best Practices",
    coverImage = "/images/business/business.png",
    date = new Date().toISOString(),
    slug = "treasury-best-practices",
    category = "Finance Operations"
  } = blog;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/blog/${slug}`}
      className="group mb-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-9 p-4 rounded-3xl bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <div className="overflow-hidden rounded-2xl w-full sm:w-[280px] h-[200px] shrink-0 bg-slate-100">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/business/business.png';
          }}
        />
      </div>

      <div className="flex-1 text-start">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary">
            {category}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {formattedDate}
          </span>
        </div>

        <h5 className="text-xl font-bold text-[#001b50] mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h5>

        <p className="text-primary text-sm font-bold inline-flex items-center gap-1.5 group-hover:underline">
          Read More →
        </p>
      </div>
    </Link>
  );
};

export default BlogCard;
