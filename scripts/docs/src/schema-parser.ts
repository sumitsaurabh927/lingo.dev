export interface ParsedProperty {
  name: string;
  fullName: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  enumValues?: unknown[];
  allowedKeys?: string[];
  children?: ParsedProperty[];
}

export interface ParsedSchema {
  rootName: string;
  properties: ParsedProperty[];
}

function resolveRef(ref: string, root: unknown): unknown {
  if (!ref.startsWith("#/")) return undefined;
  const pathSegments = ref
    .slice(2) // remove "#/"
    .split("/")
    .map((seg) => decodeURIComponent(seg));

  let current = root;
  for (const segment of pathSegments) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

function sortPropertyKeys(
  keys: string[],
  requiredKeys: string[] = [],
  customOrder: string[] = [],
): string[] {
  const keySet = new Set(keys);
  const requiredSet = new Set(requiredKeys);

  // Start with custom ordered keys that exist in the properties
  const orderedKeys: string[] = [];
  for (const key of customOrder) {
    if (keySet.has(key)) {
      orderedKeys.push(key);
      keySet.delete(key);
    }
  }

  // Handle remaining keys - separate into required and optional
  const remainingKeys = Array.from(keySet);
  const remainingRequired: string[] = [];
  const remainingOptional: string[] = [];

  for (const key of remainingKeys) {
    if (requiredSet.has(key)) {
      remainingRequired.push(key);
    } else {
      remainingOptional.push(key);
    }
  }

  // Sort alphabetically within each group
  remainingRequired.sort((a, b) => a.localeCompare(b));
  remainingOptional.sort((a, b) => a.localeCompare(b));

  return [...orderedKeys, ...remainingRequired, ...remainingOptional];
}

function getType(schema: unknown, root: unknown): string {
  if (!schema || typeof schema !== "object") return "unknown";

  const schemaObj = schema as Record<string, unknown>;

  // Handle $ref at the root level
  if (schemaObj.$ref) {
    return getTypeFromRef(schemaObj.$ref as string, root);
  }

  // Handle type property
  if (schemaObj.type) {
    return getTypeFromType(schemaObj, root);
  }

  // Handle union types (anyOf) at the top level
  if (Array.isArray(schemaObj.anyOf)) {
    return getTypeFromAnyOf(schemaObj.anyOf, root);
  }

  return "unknown";
}

// Helper to handle $ref
function getTypeFromRef(ref: string, root: unknown): string {
  const resolved = resolveRef(ref, root);
  if (resolved) {
    const resolvedType = getType(resolved, root);
    // If the resolved type is a generic type like "object", use the ref name instead
    if (resolvedType === "object" || resolvedType === "unknown") {
      return String(ref).split("/").pop() || "unknown";
    }
    return resolvedType;
  }
  return String(ref).split("/").pop() || "unknown";
}

// Helper to handle 'type' property
function getTypeFromType(
  schemaObj: Record<string, unknown>,
  root: unknown,
): string {
  // Handle array of types
  if (Array.isArray(schemaObj.type)) {
    return schemaObj.type.join(" | ");
  }

  if (schemaObj.type === "array") {
    return getTypeFromArray(schemaObj, root);
  }

  return String(schemaObj.type);
}

// Helper to handle arrays
function getTypeFromArray(
  schemaObj: Record<string, unknown>,
  root: unknown,
): string {
  const items = schemaObj.items;
  if (!items || typeof items !== "object") {
    return "array";
  }

  const itemsObj = items as Record<string, unknown>;

  // Array with $ref items
  if (itemsObj.$ref) {
    return `array of ${getTypeFromRef(itemsObj.$ref as string, root)}`;
  }

  // Array with anyOf union types
  if (Array.isArray(itemsObj.anyOf)) {
    const types = itemsObj.anyOf.map((item) => getType(item, root));
    return `array of ${types.join(" | ")}`;
  }

  // Array with direct type(s)
  if (itemsObj.type) {
    if (Array.isArray(itemsObj.type)) {
      return `array of ${itemsObj.type.join(" | ")}`;
    }
    return `array of ${itemsObj.type}`;
  }

  // Array of object or unknown
  return `array of ${getType(items, root)}`;
}

// Helper to handle anyOf (union types)
function getTypeFromAnyOf(anyOfArr: unknown[], root: unknown): string {
  const types = anyOfArr.map((item) => getType(item, root));
  return types.join(" | ");
}

function parseProperty(
  name: string,
  schema: unknown,
  required: boolean,
  parentPath = "",
  root: unknown,
): ParsedProperty {
  if (!schema || typeof schema !== "object") {
    throw new Error(`Invalid schema for property: ${name}`);
  }

  const schemaObj = schema as Record<string, unknown>;
  const fullName = parentPath ? `${parentPath}.${name}` : name;

  const property: ParsedProperty = {
    name,
    fullName,
    type: getType(schema, root),
    required,
  };

  // Extract description
  const description = schemaObj.description ?? schemaObj.markdownDescription;
  if (description) {
    property.description = String(description);
  }

  // Extract default value
  if (schemaObj.default !== undefined) {
    property.defaultValue = schemaObj.default;
  }

  // Extract enum values
  if (Array.isArray(schemaObj.enum)) {
    property.enumValues = Array.from(new Set(schemaObj.enum))
      .sort((a, b) => String(a).localeCompare(String(b)));
  }

  // Extract allowed keys
  if (
    schemaObj.propertyNames &&
    typeof schemaObj.propertyNames === "object" &&
    Array.isArray((schemaObj.propertyNames as Record<string, unknown>).enum)
  ) {
    const allowedKeys = (schemaObj.propertyNames as Record<string, unknown>)
      .enum as string[];
    if (allowedKeys.length > 0) {
      property.allowedKeys = Array.from(new Set(allowedKeys))
        .sort((a, b) => a.localeCompare(b));
    }
  }

  // Parse nested properties
  const children = parseNestedProperties(schema, fullName, root);
  if (children.length > 0) {
    property.children = children;
  }

  return property;
}

function parseNestedProperties(
  schema: unknown,
  fullName: string,
  root: unknown,
): ParsedProperty[] {
  if (!schema || typeof schema !== "object") return [];

  const schemaObj = schema as Record<string, unknown>;
  const properties: ParsedProperty[] = [];

  // Recurse into nested properties for objects
  if (schemaObj.type === "object") {
    if (schemaObj.properties && typeof schemaObj.properties === "object") {
      const nestedProps = schemaObj.properties as Record<string, unknown>;
      const nestedRequired = Array.isArray(schemaObj.required)
        ? (schemaObj.required as string[])
        : [];
      const sortedKeys = sortPropertyKeys(
        Object.keys(nestedProps),
        nestedRequired,
      );
      for (const key of sortedKeys) {
        properties.push(
          parseProperty(
            key,
            nestedProps[key],
            nestedRequired.includes(key),
            fullName,
            root,
          ),
        );
      }
    }

    // Handle schemas that use `additionalProperties`
    if (
      schemaObj.additionalProperties &&
      typeof schemaObj.additionalProperties === "object"
    ) {
      const addSchema = schemaObj.additionalProperties;
      properties.push(
        parseProperty("*", addSchema, false, fullName, root),
      );
    }
  }

  // Recurse into items for arrays of objects
  if (schemaObj.type === "array" && schemaObj.items) {
    const items = schemaObj.items as Record<string, unknown>;
    const itemSchema = items.$ref
      ? resolveRef(items.$ref as string, root) || items
      : items;

    // Handle union types in array items (anyOf)
    if (Array.isArray(items.anyOf)) {
      items.anyOf.forEach((unionItem) => {
        let resolvedItem = unionItem;
        if (unionItem && typeof unionItem === "object") {
          const unionItemObj = unionItem as Record<string, unknown>;
          if (unionItemObj.$ref) {
            resolvedItem =
              resolveRef(unionItemObj.$ref as string, root) || unionItem;
          }
        }

        if (
          resolvedItem &&
          typeof resolvedItem === "object" &&
          ((resolvedItem as Record<string, unknown>).type === "object" ||
            (resolvedItem as Record<string, unknown>).properties)
        ) {
          const resolvedItemObj = resolvedItem as Record<string, unknown>;
          const nestedRequired = Array.isArray(resolvedItemObj.required)
            ? (resolvedItemObj.required as string[])
            : [];
          const nestedProps =
            (resolvedItemObj.properties as Record<string, unknown>) || {};
          const sortedKeys = sortPropertyKeys(
            Object.keys(nestedProps),
            nestedRequired,
          );
          for (const key of sortedKeys) {
            properties.push(
              parseProperty(
                key,
                nestedProps[key],
                nestedRequired.includes(key),
                `${fullName}.*`,
                root,
              ),
            );
          }
        }
      });
    } else if (
      itemSchema &&
      typeof itemSchema === "object" &&
      ((itemSchema as Record<string, unknown>).type === "object" ||
        (itemSchema as Record<string, unknown>).properties)
    ) {
      // Handle regular object items (non-union)
      const itemSchemaObj = itemSchema as Record<string, unknown>;
      const nestedRequired = Array.isArray(itemSchemaObj.required)
        ? (itemSchemaObj.required as string[])
        : [];
      const nestedProps =
        (itemSchemaObj.properties as Record<string, unknown>) || {};
      const sortedKeys = sortPropertyKeys(
        Object.keys(nestedProps),
        nestedRequired,
      );
      for (const key of sortedKeys) {
        properties.push(
          parseProperty(
            key,
            nestedProps[key],
            nestedRequired.includes(key),
            `${fullName}.*`,
            root,
          ),
        );
      }

      // Handle additionalProperties inside array items if present
      if (
        itemSchemaObj.additionalProperties &&
        typeof itemSchemaObj.additionalProperties === "object"
      ) {
        const addSchema = itemSchemaObj.additionalProperties;
        properties.push(
          parseProperty("*", addSchema, false, `${fullName}.*`, root),
        );
      }
    }
  }

  return properties;
}

export function parseSchema(schema: unknown, customOrder: string[] = []): ParsedSchema {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema provided");
  }

  const schemaObj = schema as Record<string, unknown>;
  const rootRef = schemaObj.$ref as string | undefined;
  const rootName: string = rootRef
    ? (rootRef.split("/").pop() ?? "I18nConfig")
    : "I18nConfig";

  let rootSchema: unknown;
  if (
    rootRef &&
    schemaObj.definitions &&
    typeof schemaObj.definitions === "object"
  ) {
    const definitions = schemaObj.definitions as Record<string, unknown>;
    rootSchema = definitions[rootName];
  } else {
    rootSchema = schema;
  }

  if (!rootSchema || typeof rootSchema !== "object") {
    throw new Error(`Could not find root schema: ${rootName}`);
  }

  const rootSchemaObj = rootSchema as Record<string, unknown>;

  const required = Array.isArray(rootSchemaObj.required)
    ? (rootSchemaObj.required as string[])
    : [];

  const properties: ParsedProperty[] = [];

  if (
    rootSchemaObj.properties &&
    typeof rootSchemaObj.properties === "object"
  ) {
    const props = rootSchemaObj.properties as Record<string, unknown>;
    const sortedKeys = sortPropertyKeys(
      Object.keys(props),
      required,
      customOrder,
    );
    for (const key of sortedKeys) {
      properties.push(
        parseProperty(
          key,
          props[key],
          required.includes(key),
          "",
          schema,
        ),
      );
    }
  }

  return {
    rootName,
    properties,
  };
}