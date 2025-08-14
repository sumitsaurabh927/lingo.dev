import path from "path";
import fs from "fs";
import { execSync, spawn, ChildProcess } from "child_process";
import { test, expect } from "@playwright/test";
import {
  startProcess,
  stopProcess,
  waitForServerAtPort,
  readJsonFile,
  readJavaScriptFile,
} from "./utils";

test.describe("Next.js E2E with lingo.dev compiler", () => {
  let mockEngine: ChildProcess;
  const cwd = process.cwd();

  test.beforeAll(async () => {
    // start mock engine
    process.chdir(path.join(cwd, "../../demo-e2e/mock-engine"));
    mockEngine = await startProcess("pnpm", ["start"]);
    await waitForServerAtPort(11290);
  });

  test.afterAll(async () => {
    // stop mock engine
    stopProcess(mockEngine, 11290);
    process.chdir(cwd);
  });

  test.beforeEach(async () => {
    // change to next-e2e-app
    process.chdir(path.join(cwd, "../../demo-e2e/next-e2e-app"));
    // reset the app - delete lingo files
    execSync("pnpm reset", { stdio: "inherit" });
  });

  test.describe("build", () => {
    test.skip("generates lingo files; locale switch shows translated texts", async ({
      page,
    }) => {
      // Start the build process but don't wait for it to complete
      execSync(
        "NODE_ENV=production LINGODOTDEV_API_URL=http://localhost:11290 pnpm build",
        { stdio: "inherit" },
      );

      expect(fs.existsSync("src/lingo/meta.json")).toBeTruthy();
      expect(fs.existsSync("src/lingo/dictionary.js")).toBeTruthy();

      const meta = readJsonFile("src/lingo/meta.json");
      expect(
        meta.files["components/hero-title.tsx"].scopes[
          "0/declaration/body/0/argument"
        ].content,
      ).toBe("Hello World");

      const dictionary = readJavaScriptFile("src/lingo/dictionary.js");
      expect(
        dictionary.files["components/hero-title.tsx"].entries[
          "0/declaration/body/0/argument"
        ].content,
      ).toEqual({
        en: "Hello World",
        es: "Hola mundo",
        fr: "Bonjour le monde",
      });

      const server = await startProcess("pnpm", ["start"]);
      await waitForServerAtPort(3000);

      await page.goto("http://localhost:3000", { timeout: 30_000 });
      await page.waitForSelector("title");

      await page.selectOption("#switcher select", "en");
      await expect(page.locator("#title")).toHaveText("Hello World");
      await expect(page.locator("#subtitle")).toHaveText(
        "This is a localized paragraph.",
      );
      await expect(page.locator("#link")).toHaveAttribute("title", "Docs link");

      await page.selectOption("#switcher select", "es");
      await expect(page.locator("#title")).toHaveText("Hola mundo");
      await expect(page.locator("#subtitle")).toHaveText(
        "Este es un párrafo localizado.",
      );
      await expect(page.locator("#link")).toHaveAttribute(
        "title",
        "Enlace a los documentos",
      );

      await page.selectOption("#switcher select", "fr");
      await expect(page.locator("#title")).toHaveText("Bonjour le monde");
      await expect(page.locator("#subtitle")).toHaveText(
        "Ceci est un paragraphe localisé.",
      );
      await expect(page.locator("#link")).toHaveAttribute(
        "title",
        "Lien vers la documentation",
      );

      stopProcess(server, 3000);
    });
  });

  test.describe("dev", () => {
    test("generates lingo files; locale switch shows translated texts", async ({
      page,
    }) => {
      const server = await startProcess("pnpm", ["dev"], {
        LINGODOTDEV_API_URL: "http://localhost:11290",
      });
      await waitForServerAtPort(3000);

      await page.goto("http://localhost:3000");
      await page.waitForSelector("#title");

      expect(fs.existsSync("src/lingo/meta.json")).toBeTruthy();
      expect(fs.existsSync("src/lingo/dictionary.js")).toBeTruthy();

      const meta = readJsonFile("src/lingo/meta.json");
      expect(
        meta.files["components/hero-title.tsx"].scopes[
          "0/declaration/body/0/argument"
        ].content,
      ).toBe("Hello World");

      const dictionary = readJavaScriptFile("src/lingo/dictionary.js");
      expect(
        dictionary.files["components/hero-title.tsx"].entries[
          "0/declaration/body/0/argument"
        ].content,
      ).toEqual({
        en: "Hello World",
        es: "Hola mundo",
        fr: "Bonjour le monde",
      });

      await page.selectOption("#switcher select", "en");
      await expect(page.locator("#title")).toHaveText("Hello World");
      await expect(page.locator("#subtitle")).toHaveText(
        "This is a localized paragraph.",
      );
      await expect(page.locator("#link")).toHaveAttribute("title", "Docs link");

      await page.selectOption("#switcher select", "es");
      await expect(page.locator("#title")).toHaveText("Hola mundo");
      await expect(page.locator("#subtitle")).toHaveText(
        "Este es un párrafo localizado.",
      );
      await expect(page.locator("#link")).toHaveAttribute(
        "title",
        "Enlace a los documentos",
      );

      await page.selectOption("#switcher select", "fr");
      await expect(page.locator("#title")).toHaveText("Bonjour le monde");
      await expect(page.locator("#subtitle")).toHaveText(
        "Ceci est un paragraphe localisé.",
      );
      await expect(page.locator("#link")).toHaveAttribute(
        "title",
        "Lien vers la documentation",
      );

      stopProcess(server, 3000);
    });

    test("propagates component changes to browser", async ({ page }) => {
      const server = await startProcess("pnpm", ["dev"], {
        LINGODOTDEV_API_URL: "http://localhost:11290",
      });
      await waitForServerAtPort(3000);

      await page.goto("http://localhost:3000");
      await page.waitForSelector("#title");

      await page.selectOption("#switcher select", "en");
      await expect(page.locator("#title")).toHaveText("Hello World");

      const component = fs.readFileSync(
        "src/components/hero-title.tsx",
        "utf8",
      );
      const updatedComponent = component.replace(
        "Hello World",
        "Goodbye World",
      );
      fs.writeFileSync(
        "src/components/hero-title.tsx",
        updatedComponent,
        "utf8",
      );

      // Wait for the text to actually change to the new value
      await expect(page.locator("#title")).toHaveText("Goodbye World", {
        timeout: 10_000,
      });

      await page.selectOption("#switcher select", "es");
      await expect(page.locator("#title")).toHaveText("Adiós mundo");

      await page.selectOption("#switcher select", "fr");
      await expect(page.locator("#title")).toHaveText("Au revoir le monde");

      fs.writeFileSync("src/components/hero-title.tsx", component, "utf8");

      await expect(page.locator("#title")).toHaveText("Bonjour le monde", {
        timeout: 10_000,
      });

      await page.selectOption("#switcher select", "en");
      await expect(page.locator("#title")).toHaveText("Hello World");

      stopProcess(server, 3000);
    });
  });
});
