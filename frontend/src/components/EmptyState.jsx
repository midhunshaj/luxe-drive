import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * EmptyState — premium, animated empty state for various pages.
 * Props:
 *   icon      — emoji or SVG element
 *   title     — main headline
 *   subtitle  — supporting text
 *   cta       — { label, to } for an optional call-to-action link
 */
const EmptyState = ({ icon = '✦', title, subtitle, cta }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="relative flex flex-col items-center justify-center py-32 px-8 text-center overflow-hidden"
  >
    {/* Ambient glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-luxe-gold/5 rounded-full blur-[100px]" />
    </div>

    {/* Decorative border frame */}
    <div className="relative z-10 glass-card p-16 md:p-24 max-w-2xl w-full border-white/5">
      
      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-luxe-gold/30" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-luxe-gold/30" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-luxe-gold/30" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-luxe-gold/30" />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-6xl mb-8 text-luxe-gold/40"
      >
        {icon}
      </motion.div>

      {/* Ornamental line */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-[1px] w-12 bg-luxe-gold/20" />
        <div className="w-1 h-1 rounded-full bg-luxe-gold/40" />
        <div className="h-[1px] w-12 bg-luxe-gold/20" />
      </div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-2xl md:text-3xl font-serif text-white mb-4"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 text-xs md:text-sm font-light leading-relaxed mb-10 max-w-sm mx-auto"
      >
        {subtitle}
      </motion.p>

      {cta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Link
            to={cta.to}
            className="group inline-flex items-center gap-3 px-10 py-4 bg-luxe-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-white transition-colors duration-300"
          >
            {cta.label}
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default EmptyState;
