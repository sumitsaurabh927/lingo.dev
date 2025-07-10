import { describe, it, expect } from "vitest";
import createJsonKeysLoader from "./json-keys";

describe("createJsonKeysLoader", () => {
  it("should extract keys matching source locale from flat object", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const input = {
      title: {
        en: "Hello World",
        fr: "Bonjour le monde"
      },
      description: {
        en: "This is a description",
        de: "Das ist eine Beschreibung"
      },
      other: "not a locale object"
    };

    const result = await loader.pull("en", input);

    expect(result).toEqual({
      "title/en": "Hello World",
      "description/en": "This is a description"
    });
  });

  it("should extract keys matching source locale from nested object", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const input = {
      navigation: {
        header: {
          en: "Navigation Header",
          es: "Encabezado de Navegación"
        },
        footer: {
          en: "Footer Text"
        }
      },
      content: {
        main: {
          en: "Main Content"
        }
      }
    };

    const result = await loader.pull("en", input);

    expect(result).toEqual({
      "navigation/header/en": "Navigation Header",
      "navigation/footer/en": "Footer Text",
      "content/main/en": "Main Content"
    });
  });

  it("should handle empty object", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const input = {};

    const result = await loader.pull("en", input);

    expect(result).toEqual({});
  });

  it("should ignore non-string values for locale keys", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const input = {
      title: {
        en: "Hello World",
        fr: 123,
        de: null,
        es: undefined
      },
      config: {
        en: { nested: "object" }
      }
    };

    const result = await loader.pull("en", input);

    expect(result).toEqual({
      "title/en": "Hello World"
    });
  });

  it("should handle objects without locale keys", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const input = {
      settings: {
        theme: "dark",
        language: "english"
      },
      metadata: {
        version: "1.0.0"
      }
    };

    const result = await loader.pull("en", input);

    expect(result).toEqual({});
  });

  it("should push translations to target locale in flat structure", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const originalInput = {
      title: {
        en: "Hello World"
      },
      description: {
        en: "This is a description"
      }
    };

    await loader.pull("en", originalInput);

    const translations = {
      "title/en": "Hola Mundo",
      "description/en": "Esta es una descripción"
    };

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      title: {
        en: "Hello World",
        es: "Hola Mundo"
      },
      description: {
        en: "This is a description",
        es: "Esta es una descripción"
      }
    });
  });

  it("should push translations to target locale in nested structure", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const originalInput = {
      navigation: {
        header: {
          en: "Navigation Header"
        },
        footer: {
          en: "Footer Text"
        }
      },
      content: {
        main: {
          en: "Main Content"
        }
      }
    };

    await loader.pull("en", originalInput);

    const translations = {
      "navigation/header/en": "Encabezado de Navegación",
      "navigation/footer/en": "Texto del Pie",
      "content/main/en": "Contenido Principal"
    };

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      navigation: {
        header: {
          en: "Navigation Header",
          es: "Encabezado de Navegación"
        },
        footer: {
          en: "Footer Text",
          es: "Texto del Pie"
        }
      },
      content: {
        main: {
          en: "Main Content",
          es: "Contenido Principal"
        }
      }
    });
  });

  it("should preserve existing translations when adding new locale", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const originalInput = {
      title: {
        en: "Hello World",
        fr: "Bonjour le monde"
      },
      description: {
        en: "This is a description",
        de: "Das ist eine Beschreibung"
      }
    };

    await loader.pull("en", originalInput);

    const translations = {
      "title/en": "Hola Mundo",
      "description/en": "Esta es una descripción"
    };

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      title: {
        en: "Hello World",
        fr: "Bonjour le monde",
        es: "Hola Mundo"
      },
      description: {
        en: "This is a description",
        de: "Das ist eine Beschreibung",
        es: "Esta es una descripción"
      }
    });
  });

  it("should handle partial translations", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const originalInput = {
      title: {
        en: "Hello World"
      },
      description: {
        en: "This is a description"
      },
      footer: {
        en: "Footer text"
      }
    };

    await loader.pull("en", originalInput);

    const translations = {
      "title/en": "Hola Mundo"
    };

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      title: {
        en: "Hello World",
        es: "Hola Mundo"
      },
      description: {
        en: "This is a description"
      },
      footer: {
        en: "Footer text"
      }
    });
  });

  it("should handle empty translations", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    const originalInput = {
      title: {
        en: "Hello World"
      }
    };

    await loader.pull("en", originalInput);

    const translations = {};

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      title: {
        en: "Hello World"
      }
    });
  });

  it("should handle push with empty original input", async () => {
    const loader = createJsonKeysLoader();
    loader.setDefaultLocale("en");

    await loader.pull("en", {});

    const translations = {
      "title/en": "Hola Mundo"
    };

    const result = await loader.push("es", translations);

    expect(result).toEqual({
      title: {
        es: "Hola Mundo"
      }
    });
  });
});
