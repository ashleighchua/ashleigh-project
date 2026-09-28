import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ashleigh Chua" },
      {
        name: "description",
        content:
          "Engineering, orchestra, consulting, assistant — now I build products. Scroll and watch the mess sort itself out.",
      },
      { property: "og:title", content: "Ashleigh Chua" },
      { property: "og:description", content: "None of this was a plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <PortfolioPage />;
}
