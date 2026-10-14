import Image, { type ImageProps } from "next/image";

/**
 * next/image with our defaults: blur placeholder when we have one, lazy by
 * default. Photos uploaded through the admin are already resized WebP in
 * Supabase Storage, so they skip Next's optimizer.
 */
export default function Img({ blur, src, ...props }: Omit<ImageProps, "placeholder" | "blurDataURL"> & { blur?: string | null; src: string }) {
  const remote = /^https?:\/\//.test(src);
  return <Image src={src} {...(blur ? { placeholder: "blur", blurDataURL: blur } : {})} unoptimized={remote || src.endsWith(".svg")} {...props} />;
}
