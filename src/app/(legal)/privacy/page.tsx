import LegalPage from "../legal-page";

export const metadata = {
  title: "Privacy Policy",
  description: "ADAPT Technologies privacy policy.",
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" eyebrow="Legal" title="Privacy Policy" />;
}