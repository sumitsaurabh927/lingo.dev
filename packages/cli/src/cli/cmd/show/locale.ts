import { Command } from "interactive-commander";
import _ from "lodash";
import Z from "zod";
import Ora from "ora";
import { localeCodes } from "@lingo.dev/_spec";
import { CLIError } from "../../utils/errors";

export default new Command()
  .command("locale")
  .description("Show all supported locale codes (includes variants like en-US, en_US, etc.)")
  .helpOption("-h, --help", "Show help")
  .argument("<type>", 'Must be "sources" or "targets"')
  .action(async (type) => {
    const ora = Ora();
    try {
      switch (type) {
        default:
          throw new CLIError({
            message: `Invalid type: ${type}`,
            docUrl: "invalidType",
          });
        case "sources":
          localeCodes.forEach((locale) => console.log(locale));
          break;
        case "targets":
          localeCodes.forEach((locale) => console.log(locale));
          break;
      }
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    }
  });
