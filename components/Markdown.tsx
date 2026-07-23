import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders story-body markdown (bold, lists, links, tables, etc.) from the
 * engine's Supabase output. `inline` strips the wrapping <p> so short
 * single-line content (e.g. a key point) doesn't nest a block element
 * inside a parent <li>.
 */
export function Markdown({
  children,
  inline = false,
}: {
  children: string;
  inline?: boolean;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      disallowedElements={inline ? ["p"] : undefined}
      unwrapDisallowed={inline}
    >
      {children}
    </ReactMarkdown>
  );
}
