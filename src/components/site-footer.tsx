export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-ink/10 bg-dusk-deep px-6 py-14 text-center sm:px-10">
      <p className="font-display text-lg text-dusk-ink">Get in touch</p>
      <a
        href="mailto:hello@example.com"
        className="mt-3 inline-block font-body text-dusk-ink/70 underline decoration-light/40 underline-offset-4 transition-colors hover:text-light"
      >
        hello@example.com
      </a>
      <p className="mt-8 font-hand text-lg text-dusk-ink/50">Interviews at Light Talks</p>
      <p className="mt-6 font-body text-xs tracking-wide text-dusk-ink/35">
        &copy; {new Date().getFullYear()} Irina
      </p>
    </footer>
  );
}
