export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
export const slugToLabel = (value: string) => value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
