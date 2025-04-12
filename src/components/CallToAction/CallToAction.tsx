import React from 'react';
import { Button } from '@/components/Button';
import styles from './CallToAction.module.css';

export const CallToAction: React.FC = () => {
  return (
    <section className={styles.cta}>
      <div className={styles.content}>
        <h2 className={styles.title}>Ready to Get Started?</h2>
        <p className={styles.description}>
          Join thousands of teams already using Flock to improve their collaboration
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="large">
            Start Free Trial
          </Button>
          <Button variant="secondary" size="large">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}; 