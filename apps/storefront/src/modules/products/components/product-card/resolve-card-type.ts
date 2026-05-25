export type ProductCardType = "tire" | "wheel" | "default"

export const resolveProductCardType = (
  categoryHandle?: string
): ProductCardType => {
  if (!categoryHandle) {
    return "default"
  }

  const handle = categoryHandle.toLowerCase()

  if (
    handle === "tires" ||
    handle === "tire" ||
    handle === "reifen" ||
    handle.includes("tire")
  ) {
    return "tire"
  }

  if (
    handle === "wheels" ||
    handle === "wheel" ||
    handle === "felgen" ||
    handle === "rims" ||
    handle.includes("wheel") ||
    handle.includes("rim")
  ) {
    return "wheel"
  }

  return "default"
}
