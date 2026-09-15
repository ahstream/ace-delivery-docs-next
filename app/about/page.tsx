import { DocsLayout } from "@/components/docs-layout";

export default function AboutPage() {
  return (
    <DocsLayout hideSidebar>
      <div className="page-heading">
        <p className="eyebrow">About</p>
        <h1>About ACE Docs</h1>
        <p className="hero-copy">
          A versioned home for practical guidance about building, configuring,
          and operating Telia ACE.
        </p>
      </div>
      <div className="prose">
        <h2>What you will find here</h2>
        <p>
          This library brings product guidance, configuration instructions, and
          platform notes together in one place. Every document can carry its own
          version, status, owner, and review information.
        </p>
        <h2>How the library is maintained</h2>
        <p>
          Documentation is reviewed by the teams responsible for the relevant
          product areas. Published versions remain available so that guidance
          can be traced over time.
        </p>
      </div>
    </DocsLayout>
  );
}
