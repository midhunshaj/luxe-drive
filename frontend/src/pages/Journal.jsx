import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const Journal = () => {
  return (
    <>
      <SEO title="Journal | LuxeDrive Insights" description="High-quality articles, guides, and insights into the world of luxury automotive engineering and premium travel." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              The <span className="text-luxe-gold">Journal</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              Insights, Engineering, and the Art of Mobility
            </p>
          </motion.div>

          <div className="mb-12">
            <GoogleAd slot="REPLACE_WITH_JOURNAL_TOP_SLOT" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((article, index) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden group hover:border-luxe-gold/30 transition-all duration-500"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500 z-10" />
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] text-luxe-gold uppercase tracking-widest font-bold">{article.date}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{article.author}</span>
                  </div>
                  <h2 className="text-white text-lg font-serif mb-4 leading-snug group-hover:text-luxe-gold transition-colors">
                    <Link to={`/journal/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-400 text-sm font-light line-clamp-3 mb-6">
                    {article.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>
                  <Link 
                    to={`/journal/${article.slug}`}
                    className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-white border-b border-white/20 pb-1 hover:text-luxe-gold hover:border-luxe-gold transition-colors"
                  >
                    Read Article
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20">
            <GoogleAd slot="REPLACE_WITH_JOURNAL_BOTTOM_SLOT" />
          </div>

        </div>
      </div>
    </>
  );
};

export default Journal;
