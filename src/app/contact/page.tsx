import { Metadata } from 'next';
import Contact from '@/components/Legal/Contact';

export const metadata: Metadata = {
  title: 'Contact Us | Flock',
  description: 'Get in touch with the Flock team with any questions or feedback',
};

export default function ContactPage() {
  return <Contact />;
}
