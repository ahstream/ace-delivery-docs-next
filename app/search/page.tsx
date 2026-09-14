import Link from "next/link";
import { getAllVersions } from "@/lib/content";

export default function SearchPage() {
  const documents = getAllVersions();
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          Telia <span>ACE</span> Delivery Docs
        </Link>
        <nav>
          <Link href="/">Browse</Link>
        </nav>
      </header>
      <section className="search-page">
        <p className="eyebrow">Pagefind index</p>
        <h1>Search the library</h1>
        <p className="hero-copy">
          The production build generates a static Pagefind index with filters
          for category, topic, version, status, and tags.
        </p>
        <div className="search-box">
          <input
            aria-label="Search documentation"
            placeholder="Search documentation..."
          />
          <button type="button">Search</button>
        </div>
        <div className="search-hint">
          {documents.length} versioned pages will be indexed during CI.
        </div>
      </section>
    </main>
  );
}
