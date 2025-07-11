# i18n.json properties

This page describes the complete list of properties that are available within the `i18n.json` configuration file. This file is used by **Lingo.dev CLI** to configure the behavior of the translation pipeline.

## `$schema`

- Type: `string`
- Required: `no`
- Default: `"https://lingo.dev/schema/i18n.json"`

## `version`

Internal schema version. Do not modify manually.

- Type: `number`
- Required: `no`
- Default: `1.8`

## `locale`

Locale configuration block.

- Type: `object`
- Required: `yes`

### `locale.source`

Primary source locale code of your content (e.g. 'en', 'en-US', 'pt_BR', or 'pt-rBR'). Must be one of the supported locale codes – either a short ISO-639 language code or a full locale identifier using '-', '\_' or Android '-r' notation.

- Type: `string`
- Required: `yes`

### `locale.targets`

List of target locale codes to translate to.

- Type: `array of string`
- Required: `yes`

### `locale.extraSource`

Optional extra source locale code used as fallback during translation.

- Type: `string`
- Required: `no`

## `buckets`

- Type: `object`
- Required: `no`
- Default: `{}`
- Allowed keys:

  - `android`
  - `compiler`
  - `csv`
  - `dato`
  - `ejs`
  - `flutter`
  - `html`
  - `json`
  - `markdown`
  - `mdx`
  - `php`
  - `po`
  - `properties`
  - `srt`
  - `txt`
  - `typescript`
  - `vtt`
  - `vue-json`
  - `xcode-strings`
  - `xcode-stringsdict`
  - `xcode-xcstrings`
  - `xliff`
  - `xml`
  - `yaml`
  - `yaml-root-key`

### `buckets.*`

Configuration options for a translation bucket.

- Type: `object`
- Required: `no`

#### `buckets.*.exclude`

Glob patterns or bucket items to exclude from this bucket.

- Type: `array of string | object`
- Required: `no`
- Default: `[]`

###### `buckets.*.exclude.*.path`

Path pattern containing a \[locale] placeholder.

- Type: `string`
- Required: `yes`

###### `buckets.*.exclude.*.delimiter`

Delimiter that replaces the \[locale] placeholder in the path (default: no delimiter).

- Type: `string | null`
- Required: `no`
- Allowed values:

  - `_`
  - `-`
  - `null`

#### `buckets.*.ignoredKeys`

Keys that should be completely ignored by translation processes.

- Type: `array of string`
- Required: `no`
- Default: `[]`

#### `buckets.*.include`

Glob patterns or bucket items to include for this bucket.

- Type: `array of string | object`
- Required: `no`
- Default: `[]`

###### `buckets.*.include.*.path`

Path pattern containing a \[locale] placeholder.

- Type: `string`
- Required: `yes`

###### `buckets.*.include.*.delimiter`

Delimiter that replaces the \[locale] placeholder in the path (default: no delimiter).

- Type: `string | null`
- Required: `no`
- Allowed values:

  - `_`
  - `-`
  - `null`

#### `buckets.*.injectLocale`

Keys within files where the current locale should be injected or removed.

- Type: `array of string`
- Required: `no`

#### `buckets.*.lockedKeys`

Keys that must remain unchanged and should never be overwritten by translations.

- Type: `array of string`
- Required: `no`
- Default: `[]`

#### `buckets.*.lockedPatterns`

Regular expression patterns whose matched content should remain locked during translation.

- Type: `array of string`
- Required: `no`
- Default: `[]`

## `provider`

Configuration for the machine-translation provider.

- Type: `object`
- Required: `no`

### `provider.id`

Identifier of the translation provider service.

- Type: `string`
- Required: `yes`
- Allowed values:

  - `anthropic`
  - `google`
  - `mistral`
  - `ollama`
  - `openai`
  - `openrouter`

### `provider.model`

Model name to use for translations.

- Type: `string`
- Required: `yes`

### `provider.prompt`

Prompt template used when requesting translations.

- Type: `string`
- Required: `yes`

### `provider.baseUrl`

Custom base URL for the provider API (optional).

- Type: `string`
- Required: `no`
