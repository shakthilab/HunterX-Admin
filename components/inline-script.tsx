import Script from "next/script";

export function InlineScript({ id, html }: { id: string; html: string }) {
  return (
    <Script
      id={id}
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
