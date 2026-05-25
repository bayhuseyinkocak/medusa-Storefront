import { brand } from "@lib/brand"
import { Button, Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] w-full border-b border-ui-border-base overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950/40 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/50"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,63,94,0.15),_transparent_50%)]" />
      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 py-20 text-center small:px-32">
        <div className="flex max-w-3xl flex-col gap-4">
          <Heading
            level="h1"
            className="text-4xl font-semibold leading-tight text-white small:text-5xl"
          >
            {brand.hero.title}
          </Heading>
          <p className="text-lg leading-relaxed text-slate-300 small:text-xl">
            {brand.hero.subtitle}
          </p>
        </div>
        <LocalizedClientLink href={brand.hero.ctaHref}>
          <Button variant="primary" size="large">
            {brand.hero.ctaLabel}
          </Button>
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default Hero
