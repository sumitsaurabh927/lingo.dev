import type { ListItem, Root, RootContent } from "mdast";
import { unified } from "unified";
import remarkStringify from "remark-stringify";
import type { ParsedProperty, ParsedSchema } from "./schema-parser";

export interface MarkdownGeneratorOptions {
  title?: string;
  description?: string;
}

function makeHeadingNode(fullName: string): RootContent {
  const headingDepth = Math.min(6, 2 + (fullName.split(".").length - 1));
  return {
    type: "heading",
    depth: headingDepth as 1 | 2 | 3 | 4 | 5 | 6,
    children: [{ type: "inlineCode", value: fullName }],
  };
}

function makeDescriptionNode(description: string): RootContent {
  return {
    type: "paragraph",
    children: [{ type: "text", value: description }],
  };
}

function makeTypeBulletNode(type: string): ListItem {
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Type: " },
          { type: "inlineCode", value: type },
        ],
      },
    ],
  };
}

function makeRequiredBulletNode(required: boolean): ListItem {
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Required: " },
          { type: "inlineCode", value: required ? "yes" : "no" },
        ],
      },
    ],
  };
}

function makeDefaultBulletNode(defaultValue: unknown): ListItem {
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Default: " },
          { type: "inlineCode", value: JSON.stringify(defaultValue) },
        ],
      },
    ],
  };
}

function makeEnumBulletNode(enumValues: unknown[]): ListItem {
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Allowed values:" }],
      },
      {
        type: "list",
        ordered: false,
        spread: false,
        children: enumValues.map((v) => ({
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [{ type: "inlineCode", value: String(v) }],
            },
          ],
        })),
      },
    ],
  };
}

function makeAllowedKeysBulletNode(allowedKeys: string[]): ListItem {
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Allowed keys:" }],
      },
      {
        type: "list",
        ordered: false,
        spread: false,
        children: allowedKeys.map((v) => ({
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [{ type: "inlineCode", value: v }],
            },
          ],
        })),
      },
    ],
  };
}

function makeBullets(property: ParsedProperty): ListItem[] {
  const bullets: ListItem[] = [
    makeTypeBulletNode(property.type),
    makeRequiredBulletNode(property.required),
  ];

  if (property.defaultValue !== undefined) {
    bullets.push(makeDefaultBulletNode(property.defaultValue));
  }

  if (property.enumValues) {
    bullets.push(makeEnumBulletNode(property.enumValues));
  }

  if (property.allowedKeys) {
    bullets.push(makeAllowedKeysBulletNode(property.allowedKeys));
  }

  return bullets;
}

function generatePropertyNodes(property: ParsedProperty): RootContent[] {
  const nodes: RootContent[] = [makeHeadingNode(property.fullName)];

  // Description node
  if (property.description) {
    nodes.push(makeDescriptionNode(property.description));
  }

  // Bullet list node (with all bullets)
  const bulletItems = makeBullets(property);
  nodes.push({
    type: "list",
    ordered: false,
    spread: false,
    children: bulletItems,
  });

  // Recurse for nested properties
  if (property.children) {
    for (const child of property.children) {
      nodes.push(...generatePropertyNodes(child));
    }
  }

  return nodes;
}

export function generateMarkdown(
  parsedSchema: ParsedSchema,
  options: MarkdownGeneratorOptions = {},
): string {
  const {
    title = "i18n.json properties",
    description = "This page describes the complete list of properties that are available within the `i18n.json` configuration file. This file is used by **Lingo.dev CLI** to configure the behavior of the translation pipeline.",
  } = options;

  const children: RootContent[] = [
    {
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: title }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value:
            "This page describes the complete list of properties that are available within the ",
        },
        { type: "inlineCode", value: "i18n.json" },
        {
          type: "text",
          value: " configuration file. This file is used by ",
        },
        {
          type: "strong",
          children: [{ type: "text", value: "Lingo.dev CLI" }],
        },
        {
          type: "text",
          value: " to configure the behavior of the translation pipeline.",
        },
      ],
    },
  ];

  for (const property of parsedSchema.properties) {
    children.push(...generatePropertyNodes(property));

    // Add spacing between top-level sections
    children.push({
      type: "paragraph",
      children: [{ type: "text", value: "" }],
    });
  }

  const root: Root = { type: "root", children };
  return unified()
    .use(remarkStringify, { fences: true, listItemIndent: "one" })
    .stringify(root);
}

export function generateGitHubComment(
  markdown: string,
  commentMarker: string,
): string {
  const mdast: Root = {
    type: "root",
    children: [
      { type: "html", value: commentMarker },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value:
              "Your PR affects the Lingo.dev i18n.json configuration schema and may affect the auto-generated reference documentation. Please review the output below to ensure that the changes are correct.",
          },
        ],
      },
      { type: "html", value: "<details>" },
      {
        type: "html",
        value: "<summary>i18n.json reference docs</summary>",
      },
      { type: "code", lang: "markdown", value: markdown },
      { type: "html", value: "</details>" },
    ],
  };
  
  return unified()
    .use([[remarkStringify, { fence: "~" }]])
    .stringify(mdast)
    .toString();
}