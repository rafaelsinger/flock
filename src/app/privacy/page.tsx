import { Metadata } from 'next';
import Privacy from '@/components/Legal/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Flock',
  description: 'Privacy Policy for the Flock platform',
};

export default function PrivacyPage() {
  return <Privacy />;
}
