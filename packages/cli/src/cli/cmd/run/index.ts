import { Command } from "interactive-commander";
import setup from "./setup";
import plan from "./plan";
import execute from "./execute";
import watch from "./watch";
import { CmdRunContext, flagsSchema } from "./_types";
import {
  renderClear,
  renderSpacer,
  renderBanner,
  renderHero,
  pauseIfDebug,
  renderSummary,
} from "../../utils/ui";
import chalk from "chalk";
import trackEvent from "../../utils/observability";
import { determineAuthId } from "./_utils";

export default new Command()
  .command("run")
  .description("Translate content from source locale to target locales")
  .helpOption("-h, --help", "Show help")
  .option(
    "--source-locale <source-locale>",
    "Override source locale from configuration",
  )
  .option(
    "--target-locale <target-locale>",
    "Override target locales from configuration (can be specified multiple times)",
    (val: string, prev: string[]) => (prev ? [...prev, val] : [val]),
  )
  .option(
    "--bucket <bucket>",
    "Process specific buckets only (can be specified multiple times)",
    (val: string, prev: string[]) => (prev ? [...prev, val] : [val]),
  )
  .option(
    "--file <file>",
    "Process files matching glob pattern (can be specified multiple times)",
    (val: string, prev: string[]) => (prev ? [...prev, val] : [val]),
  )
  .option(
    "--key <key>",
    "Process specific translation keys matching glob pattern (can be specified multiple times)",
    (val: string, prev: string[]) => (prev ? [...prev, val] : [val]),
  )
  .option(
    "--force",
    "Process all keys, ignoring change detection",
  )
  .option(
    "--api-key <api-key>",
    "Override API key from configuration",
  )
  .option(
    "--debug",
    "Pause at startup for debugging",
  )
  .option(
    "--concurrency <concurrency>",
    "Maximum number of concurrent translation tasks",
    (val: string) => parseInt(val),
  )
  .option(
    "--watch",
    "Watch for file changes and retranslate automatically",
  )
  .option(
    "--debounce <milliseconds>",
    "Delay before retranslation in watch mode (default: 5000ms)",
    (val: string) => parseInt(val),
  )
  .action(async (args) => {
    let authId: string | null = null;
    try {
      const ctx: CmdRunContext = {
        flags: flagsSchema.parse(args),
        config: null,
        results: new Map(),
        tasks: [],
        localizer: null,
      };

      await pauseIfDebug(ctx.flags.debug);
      await renderClear();
      await renderSpacer();
      await renderBanner();
      await renderHero();
      await renderSpacer();

      await setup(ctx);

      authId = await determineAuthId(ctx);

      trackEvent(authId, "cmd.run.start", {
        config: ctx.config,
        flags: ctx.flags,
      });

      await renderSpacer();

      await plan(ctx);
      await renderSpacer();

      await execute(ctx);
      await renderSpacer();

      await renderSummary(ctx.results);
      await renderSpacer();

      // If watch mode is enabled, start watching for changes
      if (ctx.flags.watch) {
        await watch(ctx);
      }

      trackEvent(authId, "cmd.run.success", {
        config: ctx.config,
        flags: ctx.flags,
      });
    } catch (error: any) {
      trackEvent(authId || "unknown", "cmd.run.error", {});
      process.exit(1);
    }
  });
