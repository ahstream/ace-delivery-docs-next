import Link from "next/link";
import { getNavigation } from "@/lib/content";

export function DocsLayout({
  children,
  headerLink,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  headerLink?: React.ReactNode;
  hideSidebar?: boolean;
}) {
  const navigation = getNavigation();

  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          Telia <span>ACE</span> Delivery Docs
        </Link>
        <nav>
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
          <Link href="/help">Help</Link>
          <Link href="/admin">Admin</Link>
          {headerLink}
        </nav>
      </header>
      <div className={`docs-layout${hideSidebar ? " admin-layout" : ""}`}>
        {!hideSidebar && (
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
