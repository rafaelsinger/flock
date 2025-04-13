import { Metadata } from 'next';
import Terms from '@/components/Legal/Terms';

export const metadata: Metadata = {
  title: 'Terms of Service | Flock',
  description: 'Terms of Service for using the Flock platform',
};

export default function TermsPage() {
  return <Terms />;
}
