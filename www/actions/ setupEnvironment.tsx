import { redirect } from "next/navigation";
import { v4 } from "uuid";

export const setupEnvironment = async () => {
  "use server";
  const projectId = v4();
  redirect(`/&/${projectId}`);
};
