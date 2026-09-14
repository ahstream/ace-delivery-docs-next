import Link from "next/link";
import { getNavigation, getSummaries } from "@/lib/content";

export default function Home() {
  const summaries = getSummaries();
  const navigation = getNavigation();
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          Telia <span>ACE</span> Delivery Docs
        </Link>
        <nav>
          <Link href="/search">Search</Link>
          <a href="https://github.com/example/documentation">GitHub</a>
        </nav>
      </header>
      <section className="hero">
        <p className="eyebrow">DELIVERY KNOWLEDGE BASE</p>
        <h1>
          Lorem ipsum,
          <br />
          <em>dolor sit amet.</em>
        </h1>
        <p className="hero-copy">
          Lorem ipsum dolor sit amet. Consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <Link
          className="button"
          href="/docs/general/getting-started/onboarding"
        >
          Start with lorem ipsum <span>→</span>
        </Link>
      </section>
      <section className="home-grid">
        <aside className="side-nav">
          <p className="eyebrow">Browse library</p>
          {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <strong>{group.label}</strong>
              {group.children?.map((child) => (
                <div className="nav-section" key={child.label}>
                  <span>{child.label}</span>
                  {child.children?.map((item) => (
                    <Link key={item.href} href={item.href ?? "#"}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </aside>
        <div className="home-content">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recently published</p>
              <h2>Documents with a point of view</h2>
            </div>
            <span className="count">{summaries.length} documents</span>
          </div>
          <div className="doc-grid">
            {summaries.map((document) => (
              <Link
                className="doc-card"
                href={`/docs/${document.section ? "general" : "topics"}/${document.section ?? document.topic}/${document.slug}`}
                key={document.id}
              >
                <div className="card-top">
                  <span className={`status status-${document.status}`}>
                    {document.status}
                  </span>
                  <span>v{document.latestVersion}</span>
                </div>
                <h3>{document.title}</h3>
                <p>
                  {document.description ??
                    "Maintained guidance for building and operating our platform."}
                </p>
                <div className="tag-row">
                  {document.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
