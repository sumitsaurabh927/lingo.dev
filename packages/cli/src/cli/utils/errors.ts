export const docLinks = {
  i18nNotFound: "https://lingo.dev/cli/quickstart#initialization",
  bucketNotFound: "https://lingo.dev/cli/config#buckets",
  authError: "https://lingo.dev/cli/auth",
  localeTargetNotFound: "https://lingo.dev/cli/config#locale",
  lockFiletNotFound: "https://lingo.dev/cli/config#i18n-lock",
  failedReplexicaEngine: "https://lingo.dev/cli/",
  placeHolderFailed: "https://lingo.dev/cli/formats/json",
  translationFailed: "https://lingo.dev/cli/setup/cli#core-command-i18n",
  connectionFailed: "https://lingo.dev/cli/",
  invalidType: "https://lingo.dev/cli/setup/cli#configuration-commands",
  invalidPathPattern: "https://lingo.dev/cli/config#buckets",
  androidResouceError: "https://lingo.dev/cli/formats/android",
  invalidBucketType: "https://lingo.dev/cli/config#buckets",
  invalidStringDict: "https://lingo.dev/cli/formats/xcode-stringsdict",
};

type DocLinkKeys = keyof typeof docLinks;

export class CLIError extends Error {
  public readonly docUrl: string;

  constructor({ message, docUrl }: { message: string; docUrl: DocLinkKeys }) {
    super(message);
    this.docUrl = docLinks[docUrl];
    this.message = `${this.message}\n visit: ${this.docUrl}`;
  }
}
