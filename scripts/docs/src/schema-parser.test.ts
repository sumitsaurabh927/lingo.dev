import { describe, it, expect } from "vitest";
import { parseSchema, type ParsedSchema, type ParsedProperty } from "./schema-parser";

describe("parseSchema", () => {
  it("should parse a simple object schema", () => {
    const schema = {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name property",
        },
        age: {
          type: "number",
          description: "The age property",
        },
      },
      required: ["name"],
    };

    const result = parseSchema(schema);

    expect(result.rootName).toBe("I18nConfig");
    expect(result.properties).toHaveLength(2);
    
    const nameProperty = result.properties.find(p => p.name === "name");
    expect(nameProperty).toEqual({
      name: "name",
      fullName: "name",
      type: "string",
      description: "The name property",
      required: true,
    });

    const ageProperty = result.properties.find(p => p.name === "age");
    expect(ageProperty).toEqual({
      name: "age",
      fullName: "age",
      type: "number",
      description: "The age property",
      required: false,
    });
  });

  it("should handle schema with $ref and definitions", () => {
    const schema = {
      $ref: "#/definitions/Config",
      definitions: {
        Config: {
          type: "object",
          properties: {
            version: {
              type: "string",
              default: "1.0.0",
            },
          },
          required: ["version"],
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.rootName).toBe("Config");
    expect(result.properties).toHaveLength(1);
    expect(result.properties[0]).toEqual({
      name: "version",
      fullName: "version",
      type: "string",
      required: true,
      defaultValue: "1.0.0",
    });
  });

  it("should handle enum values", () => {
    const schema = {
      type: "object",
      properties: {
        level: {
          type: "string",
          enum: ["debug", "info", "warn", "error"],
          description: "Log level",
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.properties[0]).toEqual({
      name: "level",
      fullName: "level",
      type: "string",
      description: "Log level",
      required: false,
      enumValues: ["debug", "error", "info", "warn"], // Should be sorted
    });
  });

  it("should handle allowed keys (propertyNames)", () => {
    const schema = {
      type: "object",
      properties: {
        translations: {
          type: "object",
          propertyNames: {
            enum: ["en", "fr", "es"],
          },
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.properties[0]).toEqual({
      name: "translations",
      fullName: "translations",
      type: "object",
      required: false,
      allowedKeys: ["en", "es", "fr"], // Should be sorted
    });
  });

  it("should handle nested objects", () => {
    const schema = {
      type: "object",
      properties: {
        config: {
          type: "object",
          properties: {
            nested: {
              type: "string",
              description: "Nested property",
            },
          },
          required: ["nested"],
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.properties).toHaveLength(1);
    const configProperty = result.properties[0];
    expect(configProperty.name).toBe("config");
    expect(configProperty.children).toHaveLength(1);
    expect(configProperty.children![0]).toEqual({
      name: "nested",
      fullName: "config.nested",
      type: "string",
      description: "Nested property",
      required: true,
    });
  });

  it("should handle arrays of objects", () => {
    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
            },
            required: ["id"],
          },
        },
      },
    };

    const result = parseSchema(schema);

    const itemsProperty = result.properties[0];
    expect(itemsProperty.type).toBe("array of object");
    expect(itemsProperty.children).toHaveLength(1);
    expect(itemsProperty.children![0]).toEqual({
      name: "id",
      fullName: "items.*.id",
      type: "string",
      required: true,
    });
  });

  it("should handle arrays with $ref items", () => {
    const schema = {
      definitions: {
        Item: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      },
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/definitions/Item",
          },
        },
      },
    };

    const result = parseSchema(schema);

    const itemsProperty = result.properties[0];
    expect(itemsProperty.type).toBe("array of Item");
    expect(itemsProperty.children).toHaveLength(1);
    expect(itemsProperty.children![0]).toEqual({
      name: "name",
      fullName: "items.*.name",
      type: "string",
      required: false,
    });
  });

  it("should handle arrays with anyOf union types", () => {
    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            anyOf: [
              {
                type: "object",
                properties: {
                  type: { type: "string" },
                  value: { type: "string" },
                },
                required: ["type"],
              },
              {
                type: "object",
                properties: {
                  type: { type: "string" },
                  count: { type: "number" },
                },
                required: ["type"],
              },
            ],
          },
        },
      },
    };

    const result = parseSchema(schema);

    const itemsProperty = result.properties[0];
    expect(itemsProperty.type).toBe("array of object | object");
    expect(itemsProperty.children).toHaveLength(4); // type, value, type, count
  });

  it("should handle additionalProperties", () => {
    const schema = {
      type: "object",
      properties: {
        config: {
          type: "object",
          additionalProperties: {
            type: "string",
            description: "Any additional string property",
          },
        },
      },
    };

    const result = parseSchema(schema);

    const configProperty = result.properties[0];
    expect(configProperty.children).toHaveLength(1);
    expect(configProperty.children![0]).toEqual({
      name: "*",
      fullName: "config.*",
      type: "string",
      description: "Any additional string property",
      required: false,
    });
  });

  it("should handle union types with anyOf", () => {
    const schema = {
      type: "object",
      properties: {
        value: {
          anyOf: [
            { type: "string" },
            { type: "number" },
          ],
          description: "String or number value",
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.properties[0]).toEqual({
      name: "value",
      fullName: "value",
      type: "string | number",
      description: "String or number value",
      required: false,
    });
  });

  it("should respect custom property order", () => {
    const schema = {
      type: "object",
      properties: {
        version: { type: "string" },
        locale: { type: "string" },
        name: { type: "string" },
      },
      required: ["name"],
    };

    const customOrder = ["locale", "version"];
    const result = parseSchema(schema, customOrder);

    expect(result.properties.map(p => p.name)).toEqual(["locale", "version", "name"]);
  });

  it("should prioritize required properties after custom order", () => {
    const schema = {
      type: "object",
      properties: {
        optional1: { type: "string" },
        required1: { type: "string" },
        optional2: { type: "string" },
        required2: { type: "string" },
        first: { type: "string" },
      },
      required: ["required1", "required2"],
    };

    const customOrder = ["first"];
    const result = parseSchema(schema, customOrder);

    expect(result.properties.map(p => p.name)).toEqual([
      "first",        // Custom order first
      "required1",    // Required properties next (alphabetical)
      "required2",
      "optional1",    // Optional properties last (alphabetical)
      "optional2",
    ]);
  });

  it("should handle markdownDescription as fallback", () => {
    const schema = {
      type: "object",
      properties: {
        prop1: {
          type: "string",
          markdownDescription: "Markdown description",
        },
        prop2: {
          type: "string",
          description: "Regular description",
          markdownDescription: "Markdown description",
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.properties[0].description).toBe("Markdown description");
    expect(result.properties[1].description).toBe("Regular description"); // description takes precedence
  });

  it("should throw error for invalid schema", () => {
    expect(() => parseSchema(null)).toThrow("Invalid schema provided");
    expect(() => parseSchema("not an object")).toThrow("Invalid schema provided");
  });

  it("should throw error if root schema not found", () => {
    const schema = {
      $ref: "#/definitions/NonExistent",
      definitions: {
        SomethingElse: { type: "object" },
      },
    };

    expect(() => parseSchema(schema)).toThrow("Could not find root schema: NonExistent");
  });
});