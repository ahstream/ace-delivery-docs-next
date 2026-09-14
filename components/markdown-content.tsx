"use client";

import mermaid from "mermaid";
import dynamic from "next/dynamic";
import { createRoot, type Root } from "react-dom/client";
import { useEffect, useRef } from "react";
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((module) => module.Excalidraw),
  { ssr: false },
);

interface ExcalidrawScene {
  elements?: ExcalidrawInitialDataState["elements"];
  appState?: ExcalidrawInitialDataState["appState"];
  files?: ExcalidrawInitialDataState["files"];
}

export function MarkdownContent({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const diagrams = Array.from(
      content.querySelectorAll<HTMLElement>("[data-mermaid]"),
    );
    content
      .querySelectorAll<HTMLElement>("pre > code.language-mermaid")
      .forEach((code) => {
        const diagram = document.createElement("div");
        diagram.dataset.mermaid = "true";
        diagram.textContent = code.textContent ?? "";
        code.parentElement?.replaceWith(diagram);
        diagrams.push(diagram);
      });
    const drawings = Array.from(
      content.querySelectorAll<HTMLElement>("[data-excalidraw]"),
    );
    const roots: Root[] = [];
    if (diagrams.length === 0 && drawings.length === 0) return;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        primaryColor: "#d9f6e9",
        primaryTextColor: "#17231f",
        primaryBorderColor: "#1b6b4c",
        lineColor: "#71807a",
        secondaryColor: "#fff0e9",
        tertiaryColor: "#f7f8f5",
      },
    });

    let cancelled = false;
    void Promise.all([
      ...diagrams.map(async (diagram, index) => {
        const source = diagram.textContent?.trim() ?? "";
        if (!source) return;

        try {
          const { svg, bindFunctions } = await mermaid.render(
            `mermaid-diagram-${index}-${Date.now()}`,
            source,
          );
          if (cancelled) return;
          diagram.classList.add("mermaid-diagram");
          diagram.innerHTML = svg;
          bindFunctions?.(diagram);
        } catch (error) {
          if (cancelled) return;
          diagram.classList.add("mermaid-error");
          diagram.textContent = `Unable to render Mermaid diagram: ${error instanceof Error ? error.message : "invalid diagram source"}`;
        }
      }),
      ...drawings.map(async (drawing) => {
        const source = drawing.dataset.excalidraw;
        if (!source) return;
        drawing.classList.add("excalidraw-diagram");
        const root = createRoot(drawing);
        roots.push(root);
        try {
          const response = await fetch(source);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const scene = (await response.json()) as ExcalidrawScene;
          if (cancelled) return;
          root.render(
            <Excalidraw
              initialData={{
                elements: scene.elements ?? [],
                appState: {
                  ...scene.appState,
                  viewModeEnabled: true,
                  zenModeEnabled: true,
                },
                files: scene.files ?? {},
              }}
              viewModeEnabled
              UIOptions={{
                canvasActions: {
                  changeViewBackgroundColor: false,
                  clearCanvas: false,
                  export: false,
                  loadScene: false,
                  saveToActiveFile: false,
                  toggleTheme: false,
                },
                tools: { image: false },
              }}
            />,
          );
        } catch (error) {
          if (cancelled) return;
          drawing.classList.add("excalidraw-error");
          drawing.textContent = `Unable to render Excalidraw drawing: ${error instanceof Error ? error.message : "invalid scene"}`;
        }
      }),
    ]);

    return () => {
      cancelled = true;
      window.setTimeout(() => {
        roots.forEach((root) => root.unmount());
      }, 0);
    };
  }, []);

  return (
    <div
      ref={contentRef}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
