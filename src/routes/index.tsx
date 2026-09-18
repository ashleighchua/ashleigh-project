import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ashleigh Chua — Founder Operations + AI" },
      { name: "description", content: "Ashleigh Chua helps founders turn messy ideas, problems and projects into things that actually get done." },
      { property: "og:title", content: "Ashleigh Chua — Founder Operations + AI" },
      { property: "og:description", content: "Give me the messy thing. I’ll figure it out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <PortfolioPage />;
}
