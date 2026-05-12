export type HeroVisualVariant =
  | "code-card"
  | "recipe-card"
  | "ingredient-board"
  | "terminal-card";

export type HeroVisualTone = "warm" | "green" | "berry" | "blue" | "dark";

export type HeroVisual = {
  variant: HeroVisualVariant;
  kicker: string;
  title: string;
  lines: string[];
  chips: string[];
  tone?: HeroVisualTone;
};