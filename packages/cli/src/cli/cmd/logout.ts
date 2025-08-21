import { Command } from "interactive-commander";
import Ora from "ora";
import { getSettings, saveSettings } from "../utils/settings";
import {
  renderClear,
  renderSpacer,
  renderBanner,
  renderHero,
} from "../utils/ui";

export default new Command()
  .command("logout")
  .description("Clear stored API key and log out locally")
  .helpOption("-h, --help", "Display help for logout command")
  .action(async () => {
    try {
      await renderClear();
      await renderSpacer();
      await renderBanner();
      await renderHero();
      await renderSpacer();

      const settings = await getSettings(undefined);
      settings.auth.apiKey = "";
      await saveSettings(settings);
      Ora().succeed("Successfully logged out");
    } catch (error: any) {
      Ora().fail(error.message);
      process.exit(1);
    }
  });
