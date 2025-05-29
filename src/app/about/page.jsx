'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './about.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBrain, faPalette, faUsers } from '@fortawesome/free-solid-svg-icons';
import GSAPBlobBackground from '@/components/GSAPBlobBackground';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AboutPage = () => {
  const { status } = useSession();
  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const handleStartWriting = () => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      router.push('/write');
    }
  };

  return (
    <div className={styles.container}>
      {/* GSAP Blob Background */}
      <GSAPBlobBackground blobCount={10} />
      
      <div className={styles.wrapper}>
        <motion.div 
          className={styles.hero}
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1 
            className={styles.mainTitle}
            variants={fadeInUp}
          >
            Every pixel tells a story
          </motion.h1>
          <motion.p 
            className={styles.subtitle}
            variants={fadeInUp}
          >
            PixelPen is a canvas for creative minds and passionate storytellers. Here, your thoughts transform into powerful narratives that inspire, educate, and connect people across the globe. Whether you&apos;re sharing your first story or your thousandth, PixelPen provides the perfect space to express your unique voice.
          </motion.p>
        </motion.div>

        <motion.div 
          className={styles.content}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.section className={styles.section} variants={fadeInUp}>
            <p className={styles.missionText}>
              Ultimately, our goal is to amplify human creativity and foster meaningful connections through the art of storytelling.
            </p>
          </motion.section>

          <motion.section className={styles.section} variants={fadeInUp}>
            <p className={styles.text}>
              We believe that every story matters. Words have the power to heal, inspire, challenge, and transform. In a digital landscape often dominated by fleeting content, we&apos;re cultivating a sanctuary that celebrates depth, authenticity, and genuine human connection. A place where quality trumps quantity, and where thoughtful expression finds its rightful audience.
            </p>
          </motion.section>

          <motion.section className={styles.section} variants={fadeInUp}>
            <p className={styles.text}>
              Thousands of writers, dreamers, and thinkers choose PixelPen as their creative home every month. They&apos;re entrepreneurs sharing their journey, students exploring new ideas, parents documenting their experiences, artists expressing their vision, and everyday people with extraordinary stories to tell. They write about their passions, their struggles, their discoveries, and the wisdom they&apos;ve gathered along the way.
            </p>
          </motion.section>

          <motion.section className={styles.section} variants={fadeInUp}>
            <p className={styles.text}>
              Rather than cluttering your experience with intrusive advertisements, PixelPen is built on the foundation of community support and the belief that great content deserves a clean, distraction-free environment. We&apos;re committed to creating a platform where writers can focus on what they do best—crafting stories that matter.
            </p>
          </motion.section>

          <motion.section 
            className={`${styles.section} ${styles.featuresSection}`}
            variants={scaleIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2 
              className={styles.sectionTitle}
              variants={fadeInUp}
            >
              What Makes PixelPen Unique?
            </motion.h2>
            
            <motion.div 
              className={styles.featureGrid}
              variants={staggerContainer}
            >
              <motion.div className={styles.feature} variants={fadeInUp}>
                <motion.div 
                  className={styles.featureIcon}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FontAwesomeIcon icon={faBrain} />
                </motion.div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>AI-Powered Interactions</h3>
                  <p className={styles.featureText}>
                    Every article comes with intelligent summaries and a context-aware chatbot that understands the content. Engage deeper with ideas through meaningful AI-assisted conversations that enhance your reading experience.
                  </p>
                </div>
              </motion.div>

              <motion.div className={styles.feature} variants={fadeInUp}>
                <motion.div 
                  className={styles.featureIcon}
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FontAwesomeIcon icon={faPalette} />
                </motion.div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Modern Design</h3>
                  <p className={styles.featureText}>
                    Experience storytelling through a clean, vibrant, and fully responsive interface that adapts beautifully to any device. Our design philosophy puts content first while maintaining visual elegance.
                  </p>
                </div>
              </motion.div>

              <motion.div className={styles.feature} variants={fadeInUp}>
                <motion.div 
                  className={styles.featureIcon}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FontAwesomeIcon icon={faUsers} />
                </motion.div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Real-Time Engagement</h3>
                  <p className={styles.featureText}>
                    Connect with writers and readers through personalized profiles, detailed writing statistics, and active feedback loops. Build your audience and track your growth in real-time.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>

          <motion.section className={styles.section} variants={fadeInUp}>
            <p className={styles.text}>
              If you&apos;re new to PixelPen, we invite you to explore the rich tapestry of stories waiting to be discovered. Find content that resonates with your interests, challenges your perspective, or teaches you something new. When you&apos;re ready, pick up your digital pen and add your voice to our growing community of storytellers.
            </p>
          </motion.section>
        </motion.div>

        <motion.div 
          className={styles.ctaSection}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
        >
          <motion.div 
            className={styles.ctaButtons}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Link href="/blog" className={styles.ctaButton}>
                <motion.span
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Start reading
                </motion.span>
                <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <button onClick={handleStartWriting} className={styles.ctaButton}>
                <motion.span
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Start writing
                </motion.span>
                <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.footer}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.footerText}>
            &ldquo;In every pixel lies the potential for a masterpiece. In every story lies the power to change the world.&rdquo;
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage; 