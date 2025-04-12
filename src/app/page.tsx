import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { CallToAction } from '@/components/CallToAction';
import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.container}>
      <Hero />
      <Features />
      <CallToAction />
    </div>
  );
} 