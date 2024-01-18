import { ListenBrainzClient } from "../client.ts";
import { formatListen } from "../listen.ts";
import { chunk, readListensFile } from "../utils.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

export const cli = new Command()
  .name("manage.ts")
  .version("0.5.0")
  .description("Manage your ListenBrainz listens.")
  .globalEnv("LB_TOKEN=<UUID>", "ListenBrainz user token.", {
    prefix: "LB_",
    required: true,
  })
  .command("import <path:file>", "Import listens from the given JSON file.")
  .option("-p, --preview", "Show listens instead of submitting them.")
  .action(async (options, path) => {
    const client = new ListenBrainzClient({ userToken: options.token });
    const listenSource = readListensFile(path);
    if (options.preview) {
      for await (const listen of listenSource) {
        console.log(formatListen(listen));
      }
    } else {
      let count = 0;
      for await (const listens of chunk(listenSource, 100)) {
        await client.import(listens);
        count += listens.length;
        console.info(count, "listens imported");
      }
    }
  });

if (import.meta.main) {
  await cli.parse();
}
