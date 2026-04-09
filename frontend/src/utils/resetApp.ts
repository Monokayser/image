import { api } from "../api";

const confirmationPhrase = "RESET";

export async function resetApplicationData() {
  const confirmation = window.prompt(
    `This will remove all users, workspaces, tasks, and comments.\nType ${confirmationPhrase} to continue.`,
    "",
  );

  if (confirmation === null) {
    return { reset: false, cancelled: true };
  }

  if (confirmation.trim().toUpperCase() !== confirmationPhrase) {
    throw new Error(`Reset cancelled. Type ${confirmationPhrase} exactly to continue.`);
  }

  await api.post<void>("/api/system/reset");
  return { reset: true, cancelled: false };
}
