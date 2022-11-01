import Logger from "../utils/Logger";
import Interface, { Command } from "./Interface";
const c = new Logger("/exit", "blue");

export default async function handle(command: Command,executor: boolean) {
    c.log("Good riddance!");
    process.exit(0);
}