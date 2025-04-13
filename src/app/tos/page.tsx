import { Metadata } from 'next';
import Terms from '@/components/Legal/Terms';

export const metadata: Metadata = {
  title: 'Terms of Service | Flock',
  description: 'Terms of Service for using Flock',
};

export default function TermsPage() {
  return <Terms />;
}
