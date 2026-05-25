"use client"

import { getBrandLogoUrl } from "@lib/util/brand-logo"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useState } from "react"

type BrandLogoProps = {
  brand: string
  className?: string
}

export default function BrandLogo({ brand, className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)
  const slug = brand.trim().toLowerCase()

  if (!brand || failed) {
    return (
      <span className={clx("txt-compact-small text-ui-fg-muted", className)}>
        {slug}
      </span>
    )
  }

  return (
    <Image
      src={getBrandLogoUrl(brand)}
      alt={`${brand} logo`}
      width={120}
      height={32}
      className={clx("h-7 w-auto max-w-[7.5rem] object-contain object-left", className)}
      onError={() => setFailed(true)}
      unoptimized
    />
  )
}
