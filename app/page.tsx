import Link from "next/link";
import { getSummaries } from "@/lib/content";
import { DocsLayout } from "@/components/docs-layout";

const homepageSections = [
  "customer",
  "delivery",
  "developer",
  "technology",
] as const;

export default function Home() {
  const summaries = getSummaries();
  const sectionDescriptions = {
    delivery: "Operational guidance for configuring and running ACE services.",
    developer: "Integration patterns, APIs, and implementation guidance.",
    customer: "Product overviews and practical guidance for ACE customers.",
    technology: "Architecture, security, and platform engineering references.",
  };
  return (
    <DocsLayout hideSidebar>
      <div className="page-heading home-page-heading">
        <p className="eyebrow">Documentation library</p>
        <h1>ACE Documentation</h1>
        <p className="hero-copy">
          Versioned guidance for building, configuring, and operating Telia ACE.
        </p>
      </div>
      <div className="section-grid">
        {homepageSections.map((section) => {
          const count = summaries.filter(
            (document) => document.siteSection === section,
          ).length;
          return (
            <Link className="section-card" href={`/${section}`} key={section}>
              <p className="eyebrow">Section</p>
              <h2>{section}</h2>
              <p>{sectionDescriptions[section]}</p>
              <span>{count} documents →</span>
            </Link>
          );
        })}
      </div>
    </DocsLayout>
  );
}
