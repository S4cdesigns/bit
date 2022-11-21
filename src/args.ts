import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import VERSION from "./version";

const argv = yargs(hideBin(process.argv))
  .version(VERSION)
  .option("process-queue", {
    type: "boolean",
    description: "(Used internally, don't use manually)",
    default: false,
  })
  .option("skip-compaction", {
    type: "boolean",
    description: "Skip database file compaction (decreases startup time)",
    default: false,
  })
  .option("update-izzy", {
    type: "boolean",
    description: "Remove database binary and download latest version",
    default: false,
  })
  .option("generate-image-thumbnails", {
    type: "boolean",
    description: "Generate all image thumbnails",
    default: false,
  })
  .option("reindex", {
    type: "boolean",
    description: "Delete search indices and rebuild",
    default: false,
  })
  .option("reset-izzy", {
    type: "boolean",
    description: "Reload database from files",
    default: false,
  })
  .parse();

export default argv as Awaited<typeof argv>;
