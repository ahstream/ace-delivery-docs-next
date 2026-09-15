import Link from "next/link";
import { getNavigation } from "@/lib/content";
import type { SiteSection } from "@/lib/types";

const sectionTitles: Record<SiteSection | "admin", string> = {
  delivery: "ACE Delivery Docs",
  developer: "ACE Developer Docs",
  customer: "ACE Customer Docs",
  technology: "ACE Technology Docs",
  admin: "Administration",
};
const dropdownSections: SiteSection[] = [
  "customer",
  "delivery",
  "developer",
  "technology",
];

export function DocsLayout({
  children,
  headerLink,
  hideSidebar = false,
  section,
}: {
  children: React.ReactNode;
  headerLink?: React.ReactNode;
  hideSidebar?: boolean;
  section?: SiteSection | "admin";
}) {
  const navigation =
    section === "admin"
      ? [
          {
            label: "Administration",
            kind: "group" as const,
            children: [
              { label: "Help", kind: "document" as const, href: "/admin/help" },
            ],
          },
        ]
      : section
        ? getNavigation(section)
        : [];
  const isAdmin = section === "admin";

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-lockup">
          <Link className="brand" href="/">
            Telia <span>ACE</span> Docs
          </Link>
          {section && (
            <span className="brand-section">{sectionTitles[section]}</span>
          )}
        </div>
        <nav>
          <details className="section-menu">
            <summary>Sections</summary>
            <div className="section-menu-items">
              {dropdownSections.map((siteSection) => (
                <Link href={`/${siteSection}`} key={siteSection}>
                  {siteSection}
                </Link>
              ))}
              <Link href="/admin">admin</Link>
            </div>
          </details>
          {section && section !== "admin" && (
            <Link href={`/${section}/search`}>Search</Link>
          )}
          <Link href="/about">About</Link>
          {section === "admin" && <Link href="/admin/help">Help</Link>}
          {headerLink}
        </nav>
      </header>
      {isAdmin && (
        <nav className="admin-nav" aria-label="Administration navigation">
          <span className="eyebrow">Administration</span>
          <Link href="/admin">Document inventory</Link>
          <Link href="/admin/help">Help</Link>
        </nav>
      )}
      <div
        className={`docs-layout${hideSidebar || isAdmin ? " admin-layout" : ""}`}
      >
        {!hideSidebar && !isAdmin && (
          <aside className="docs-sidebar" aria-label="Documentation navigation">
            <p className="eyebrow">Browse library</p>
            {navigation.map((group) => (
              <section className="nav-group" key={group.label}>
                <h2>{group.label}</h2>
                {group.children?.map((category) => (
                  <div className="nav-category" key={category.label}>
                    <p>{category.label}</p>
                    {category.children?.map((item) => (
                      <Link key={item.href} href={item.href ?? "#"}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </aside>
        )}
        <section className="docs-content">{children}</section>
      </div>
    </main>
  );
}
