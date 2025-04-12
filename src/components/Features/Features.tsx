import React from 'react';
import styles from './Features.module.css';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className={styles.card}>
    <div className={styles.iconWrapper}>{icon}</div>
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardDescription}>{description}</p>
  </div>
);

export const Features: React.FC = () => {
  const features = [
    {
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with your team in real-time',
      icon: '🤝'
    },
    {
      title: 'Smart Organization',
      description: 'Keep your projects organized with intelligent tools',
      icon: '📊'
    },
    {
      title: 'Secure Communication',
      description: 'End-to-end encrypted messaging for your peace of mind',
      icon: '🔒'
    }
  ];

  return (
    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>Why Choose Flock?</h2>
      <div className={styles.grid}>
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}; 