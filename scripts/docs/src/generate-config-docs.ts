import { LATEST_CONFIG_DEFINITION } from "@lingo.dev/_spec/src/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createOrUpdateGitHubComment, formatMarkdown } from "./utils";
import { parseSchema } from "./schema-parser";
import { generateMarkdown, generateGitHubComment } from "./markdown-generator";

const ROOT_PROPERTY_ORDER = ["$schema", "version", "locale", "buckets"];


async function main() {
  const commentMarker = "<!-- generate-config-docs -->";
  const isGitHubAction = Boolean(process.env.GITHUB_ACTIONS);

  const outputArg = process.argv[2];

  const schema = zodToJsonSchema(LATEST_CONFIG_DEFINITION.schema, {
    name: "I18nConfig",
    markdownDescription: true,
  });

  // Ensure the `version` property reflects the latest schema version in docs
  if (
    schema &&
    typeof schema === "object" &&
    "definitions" in schema &&
    schema.definitions &&
    typeof schema.definitions === "object" &&
    "I18nConfig" in schema.definitions
  ) {
    const i18nConfig = schema.definitions.I18nConfig;
    if (
      i18nConfig &&
      typeof i18nConfig === "object" &&
      "properties" in i18nConfig &&
      i18nConfig.properties &&
      typeof i18nConfig.properties === "object" &&
      "version" in i18nConfig.properties
    ) {
      const versionProp = i18nConfig.properties.version;
      if (versionProp && typeof versionProp === "object") {
        (versionProp as Record<string, unknown>).default =
          LATEST_CONFIG_DEFINITION.defaultValue.version;
      }
    }
  }

  console.log("🔄 Generating i18n.json reference docs...");
  
  // Parse the schema into a traversable data structure
  const parsedSchema = parseSchema(schema, ROOT_PROPERTY_ORDER);
  
  // Generate markdown from the parsed schema
  const markdown = generateMarkdown(parsedSchema);
  const formattedMarkdown = await formatMarkdown(markdown);

  if (isGitHubAction) {
    const body = generateGitHubComment(formattedMarkdown, commentMarker);
    await createOrUpdateGitHubComment({
      commentMarker,
      body,
    });
    return;
  }

  if (!outputArg) {
    throw new Error(
      "Output file path is required. Usage: generate-config-docs <output-path>",
    );
  }

  const outputFilePath = resolve(process.cwd(), outputArg);
  console.log(`💾 Saving to ${outputFilePath}...`);
  mkdirSync(dirname(outputFilePath), { recursive: true });
  writeFileSync(outputFilePath, formattedMarkdown);
  console.log(`✅ Saved to ${outputFilePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
