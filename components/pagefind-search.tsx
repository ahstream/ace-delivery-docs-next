"use client";

import { FormEvent, useState } from "react";

interface PagefindResult {
  url: string;
  excerpt: string;
  meta?: { title?: string };
}

interface PagefindSearchResponse {
  results: Array<{ data: () => Promise<PagefindResult> }>;
}

interface PagefindModule {
  search: (term: string) => Promise<PagefindSearchResponse>;
}

export function PagefindSearch({
  basePath,
  section,
}: {
  basePath: string;
  section: string;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    if (!query) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const pagefind = (await import(
        /* webpackIgnore: true */ `${basePath}/_pagefind/pagefind.js`
      )) as PagefindModule;
      const response = await pagefind.search(query);
      const sectionPrefix = `${basePath}/${section}/`;
      const matches = await Promise.all(
        response.results.map((result) => result.data()),
      );
      setResults(
        matches.filter((result) => result.url.startsWith(sectionPrefix)),
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="search-box" onSubmit={search}>
        <input
          aria-label="Search documentation"
          placeholder="Search documentation..."
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p className="search-hint">Searching...</p>}
      {!loading && searched && results.length === 0 && (
        <p className="search-hint">No matching documentation found.</p>
      )}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <a href={result.url} key={result.url}>
              <strong>{result.meta?.title ?? "Documentation result"}</strong>
              <span dangerouslySetInnerHTML={{ __html: result.excerpt }} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
