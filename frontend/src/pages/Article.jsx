import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { articles } from '../data/articles';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const Article = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const foundArticle = articles.find(a => a.slug === slug);
    if (foundArticle) {
      setArticle(foundArticle);
    } else {
      navigate('/journal');
    }
  }, [slug, navigate]);

  if (!article) return <div className="min-h-screen bg-luxe-dark"></div>;

  return (
    <>
      <SEO title={`${article.title} | LuxeDrive`} description={article.content.replace(/<[^>]*>?/gm, '').substring(0, 160)} />
      
      <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        
        {/* Article Hero */}
        <div className="relative h-[60vh] w-full mb-16">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: \`url('\${article.image}')\` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxe-dark via-luxe-dark/60 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 w-full z-10 px-4 pb-12">
            <div className="max-w-4xl mx-auto">
              <Link to="/journal" className="inline-block mb-6 text-[10px] uppercase tracking-[0.2em] font-bold text-luxe-gold hover:text-white transition-colors">
                ← Back to Journal
              </Link>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight"
              >
                {article.title}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-6"
              >
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold border-r border-gray-700 pr-6">
                  {article.date}
                </span>
                <span className="text-[10px] text-luxe-gold uppercase tracking-widest font-bold">
                  By {article.author}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <GoogleAd slot="REPLACE_WITH_ARTICLE_TOP_SLOT" />
          </div>

          {/* Article Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-luxe prose-lg max-w-none 
                       prose-headings:font-serif prose-headings:font-normal prose-headings:text-white prose-headings:mb-6 prose-headings:mt-12
                       prose-h2:text-3xl prose-h2:border-l-4 prose-h2:border-luxe-gold prose-h2:pl-6
                       prose-p:text-gray-400 prose-p:font-light prose-p:leading-relaxed prose-p:mb-6 prose-p:text-justify
                       prose-a:text-luxe-gold prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mt-16 pt-16 border-t border-gray-900">
            <GoogleAd slot="REPLACE_WITH_ARTICLE_BOTTOM_SLOT" />
          </div>

        </div>
      </div>
    </>
  );
};

export default Article;
