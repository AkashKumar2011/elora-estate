import Button from '../../components/Button';

// Spec: "Do not add unnecessary pages" / "do not over-engineer V1." A
// contact form would need its own backend endpoint and inbox workflow
// that nothing else in the spec asks for — direct call/WhatsApp links get
// a person to a broker faster anyway, which is the actual goal.
const CONTACT_MOBILE = import.meta.env.VITE_CONTACT_MOBILE || '9999999999';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-4">Contact Us</h1>
      <p className="text-basalt/80 mb-8">
        The fastest way to reach us is a call or WhatsApp message — a broker will get back to you directly.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={`tel:+91${CONTACT_MOBILE}`}>
          <Button>Call us</Button>
        </a>
        <a href={`https://wa.me/91${CONTACT_MOBILE}`} target="_blank" rel="noreferrer">
          <Button variant="outline">WhatsApp us</Button>
        </a>
      </div>
    </div>
  );
}
