import { Tag } from "@/api/ao"

/**
 * Find the value for a tag name
 */
export const getTagValue = (tagName: string, tags: Tag[]) =>
  tags.find((t) => t.name === tagName)?.value

/**
 * Flatten tags to a key value object
 */
export const flattenTags = (tags: Tag[]) =>
  tags.reduce(
    (acc, tag) => {
      acc[tag.name] = tag.value
      return acc
    },
    {} as Record<string, string>,
  )

/**
 * Returns if this is a valid arweave id
 */
export const isArweaveId = (addr: string) => /^[a-z0-9_-]{43}$/i.test(addr)
