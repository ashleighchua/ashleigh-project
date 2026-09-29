/*
 * POST /api/sticker: a visitor left a sticker (and maybe a note) on the table.
 * Emails it to Ashleigh through Resend. The browser only ever talks to this site,
 * so ad blockers and filtered networks can't stop it.
 */
import { createFileRoute } from "@tanstack/react-router";
import { LINKS, TABLE_STICKERS } from "@/components/portfolio/data";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\n/g, "<br>");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/sticker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["RESEND_API_KEY"];
        if (!key) return json({ ok: false, error: "email not set up" }, 503);

        let body: { kind?: unknown; name?: unknown; note?: unknown; honey?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ ok: false, error: "bad request" }, 400);
        }
        const str = (v: unknown, max: number) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";
        // bots fill the hidden field; tell them it worked and send nothing
        if (str(body.honey, 200)) return json({ ok: true });
        const sticker = TABLE_STICKERS.find((t) => t.kind === body.kind);
        if (!sticker) return json({ ok: false, error: "pick a sticker" }, 400);
        const name = str(body.name, 80);
        const note = str(body.note, 600);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env["STICKER_FROM"] ?? "Portfolio table <onboarding@resend.dev>",
            to: [process.env["STICKER_TO"] ?? LINKS.email],
            subject: `${name || "Someone"} left you a “${sticker.label}” sticker`,
            html: `<p><b>Sticker:</b> ${esc(sticker.label)}</p><p><b>From:</b> ${esc(name || "Anonymous")}</p><p><b>Note:</b><br>${note ? esc(note) : "<i>No note, just the sticker.</i>"}</p>`,
          }),
        });
        if (!res.ok) {
          console.error("resend", res.status, await res.text());
          return json({ ok: false, error: "email failed" }, 502);
        }
        return json({ ok: true });
      },
    },
  },
});
