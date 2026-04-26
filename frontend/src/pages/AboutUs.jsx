import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const AboutUs = () => {
  return (
    <>
      <SEO title="About Us | LuxeDrive" description="Learn more about LuxeDrive, our mission, and the team behind the world's most exclusive car rental fleet." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              About <span className="text-luxe-gold">Us</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              The Genesis of Excellence
            </p>
          </motion.div>

          <div className="prose prose-invert prose-luxe max-w-none space-y-8">
            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                Our Story
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Founded with a passion for automotive perfection, LuxeDrive was established to bridge the gap between discerning individuals and the world's most extraordinary vehicles. We recognized that traditional car rental services lacked the sophistication, attention to detail, and personalized care that true automotive enthusiasts demand. 
              </p>
              <p className="leading-relaxed text-base font-light text-justify mt-4">
                What began as a curated collection of high-performance sports cars has evolved into a comprehensive lifestyle service. We don't just provide a vehicle; we deliver an experience, ensuring that every mile driven is as memorable as the destination itself.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                Our Mission
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Our mission is to redefine the standard of luxury mobility. We are committed to offering an impeccable fleet, maintained to the highest specifications, alongside white-glove service that anticipates and exceeds the needs of our clientele. At LuxeDrive, we believe that the journey should be nothing short of extraordinary.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                The Fleet
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Our fleet is a meticulously selected portfolio of automotive masterpieces. From the raw power of Italian exotics to the refined elegance of British luxury sedans, every vehicle is chosen for its character, performance, and aesthetic appeal. We continuously update our collection to ensure our clients have access to the latest and most sought-after models on the market.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                Commitment to Excellence
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Excellence is not just a goal; it's our standard operating procedure. This commitment is reflected in every interaction, from the seamless booking process powered by our state-of-the-art platform to the pristine condition of our vehicles upon delivery. We strive for perfection in every detail, ensuring your experience with LuxeDrive is flawless.
              </p>
            </section>
          </div>

          <div className="mt-16">
            <GoogleAd slot="REPLACE_WITH_ABOUT_SLOT" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
