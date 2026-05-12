import type { HeroVisual } from "../types/heroVisual";

const fallbackHeroVisual: HeroVisual = {
  variant: "code-card",
  tone: "warm",
  kicker: "Today's recipe",
  title: "Code snack",
  lines: ["concept = value", "practice = True", "level += 1"],
  chips: ["python", "basics", "practice"],
};

const heroVisualsBySlug: Record<string, HeroVisual> = {
  "variables-and-assignment": {
    variant: "recipe-card",
    tone: "warm",
    kicker: "Today's recipe",
    title: "Label board",
    lines: ['flavor = "mango"', "level = 1", 'flavor = "berry"'],
    chips: ["names", "values", "reassignment"],
  },

  "mutable-vs-immutable-objects": {
    variant: "ingredient-board",
    tone: "green",
    kicker: "Kitchen logic",
    title: "Changeable bowl",
    lines: [
      'basket = ["apple"]',
      'basket.append("pear")',
      'word = word + "!"',
    ],
    chips: ["mutable", "immutable", "references"],
  },

  lists: {
    variant: "recipe-card",
    tone: "blue",
    kicker: "Shopping list",
    title: "List pantry",
    lines: ['items = ["eggs", "milk"]', 'items.append("bread")', "items[0]"],
    chips: ["list", "index", "append"],
  },

  dictionaries: {
    variant: "recipe-card",
    tone: "berry",
    kicker: "Recipe notes",
    title: "Key-value menu",
    lines: [
      'recipe = {"name": "cake"}',
      'recipe["time"] = 30',
      'recipe["name"]',
    ],
    chips: ["keys", "values", "lookup"],
  },
};

export function getHeroVisualByLessonSlug(slug: string): HeroVisual {
  return heroVisualsBySlug[slug] ?? fallbackHeroVisual;
}