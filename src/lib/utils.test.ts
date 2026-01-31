import { expect, test } from "vitest";
import { cn } from "./utils";

test("cn merges class names correctly", () => {
  expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  expect(cn("text-lg", { "font-bold": true, "italic": false })).toBe("text-lg font-bold");
});
