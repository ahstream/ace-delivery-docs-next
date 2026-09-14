import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";

interface MarkdownNode {
  type: string;
  lang?: string;
  value?: string;
  children?: MarkdownNode[];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function remarkMermaid() {
  return (tree: MarkdownNode) => {
    const visit = (node: MarkdownNode) => {
      if (node.type === "code" && node.lang === "mermaid") {
        node.type = "html";
        node.value = `<div data-mermaid="true">${escapeHtml(node.value ?? "")}</div>`;
        delete node.lang;
        return;
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

export async function renderMarkdown(
  markdown: string,
  assetBase = "",
): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMermaid)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return String(result).replaceAll(
    /((?:src|href|data-excalidraw)=['"])(\.\/)?assets\//g,
    `$1${assetBase}/assets/`,
  );
}
