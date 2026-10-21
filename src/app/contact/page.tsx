import { Mail, MapPin, Building2 } from "lucide-react";
import { getAllSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Contact ADAPT Technologies. Founder & CEO: Mope Samuel Maphutseng. Email: pulamaliboho@gmail.com. Location: Lesotho.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getAllSettings();
  const ct = settings.contact;
  const f = settings.founder;

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's build something real"
        lead="Whether you are a client, partner, institution or future teammate — the founder's team reads every message."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <div className="card">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-400">
                <Building2 className="h-4 w-4 text-accent-400" aria-hidden="true" />
                {ct.company}
              </h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Founder &amp; CEO</dt>
                  <dd className="mt-1 font-medium text-white">{f.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${ct.email}`} className="font-medium text-accent-400 hover:text-accent-300">
                      {ct.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Location</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-medium text-white">
                    <MapPin className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {ct.location}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-white">What happens next?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Your message goes straight to the ADAPT team inbox. We review submissions
                personally and aim to respond to serious inquiries. Thank you for reaching out.
              </p>
              <a href={`mailto:${ct.email}`} className="btn-secondary mt-5 w-full">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email us directly
              </a>
            </div>
          </div>

          <div id="contact-form">
            <SectionHeading
              eyebrow="Get in touch"
              title="Send a message"
              className="mb-6"
            />
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}