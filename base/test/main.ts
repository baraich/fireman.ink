import { defaultFiremanAgent } from "@/lib/agent";

async function run() {
  const response = defaultFiremanAgent.processMessage(
    "Create a Music Player.",
    [],
    "none"
  );

  for await (const chunk of response.textStream) {
    process.stdout.write(chunk);
  }

  console.log(await response.steps);
}
run();
