import LegalPage from "../legal-page";

export const metadata = {
  title: "Cookie Policy",
  description: "ADAPT Technologies cookie policy.",
};

export default function CookiesPage() {
  return <LegalPage slug="cookies" eyebrow="Legal" title="Cookie Policy" />;
}