export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getValidLink(url: string | null | undefined): string {
  if (!url) return "#";
  
  // Convert legacy brand links to new structure
  if (url.startsWith("/products?brand=")) {
    const slug = url.split("=")[1];
    return `/brand/${slug}`;
  }
  
  return url;
}
