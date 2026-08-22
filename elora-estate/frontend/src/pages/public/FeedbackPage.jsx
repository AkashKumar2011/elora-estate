import Button from '../../components/Button';

const CONTACT_MOBILE = import.meta.env.VITE_CONTACT_MOBILE || '9999999999';

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-4">Feedback</h1>
      <p className="text-basalt/80 mb-8">
        Had a good or bad experience? Tell us directly — it goes straight to the team, not a queue.
      </p>
      <a href={`https://wa.me/91${CONTACT_MOBILE}?text=${encodeURIComponent('Hi, I wanted to share some feedback: ')}`} target="_blank" rel="noreferrer">
        <Button>Share feedback on WhatsApp</Button>
      </a>
    </div>
  );
}
