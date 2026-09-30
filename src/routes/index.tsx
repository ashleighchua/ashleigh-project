import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";

/** What people see when the link is shared (iMessage, WhatsApp, LinkedIn, Slack…) */
const SITE = "https://ashleigh-project.vercel.app";
const TITLE = "Ashleigh Chua · I turn ideas into real products";
const DESCRIPTION =
  "Cofounder of SchoolTrips.ai. I find the real problem, build the product, and stick around to grow it with you.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE },
      { property: "og:site_name", content: "Ashleigh Chua" },
      { property: "og:image", content: `${SITE}/og-image.png?v=2` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "Ashleigh Chua: I turn ideas into real products, shown beside a receipt totalling one real product",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE}/og-image.png?v=2` },
    ],
  }),
  component: Index,
});

function Index() {
  return <PortfolioPage />;
}
