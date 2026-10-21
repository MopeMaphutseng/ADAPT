import LegalPage from "../legal-page";

export const metadata = {
  title: "Terms of Service",
  description: "ADAPT Technologies terms of service.",
};

export default function TermsPage() {
  return <LegalPage slug="terms" eyebrow="Legal" title="Terms of Service" />;
}