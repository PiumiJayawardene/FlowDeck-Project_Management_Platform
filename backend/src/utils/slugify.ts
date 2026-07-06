import Organization from "../models/Organization.model"

export const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  let slug = baseSlug
  let counter = 1

  while (await Organization.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`
    counter += 1
  }

  return slug
}