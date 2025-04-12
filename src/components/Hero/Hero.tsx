import React from 'react';
import { Button } from '../Button';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Flock</h1>
        <p className={styles.subtitle}>
          Connect, collaborate, and create together with your team
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="large">
            Get Started
          </Button>
          <Button variant="secondary" size="large">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}; 