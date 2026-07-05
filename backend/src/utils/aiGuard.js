let cooldownUntil = 0;

export function isAiInCooldown() {
  return Date.now() < cooldownUntil;
}

export function triggerCooldown(minutes = 60) {
  cooldownUntil = Date.now() + minutes * 60 * 1000;
  console.log(`⏸ AI in cooldown for ${minutes} minutes (until ${new Date(cooldownUntil).toISOString()})`);
}

export function getCooldownRemaining() {
  const remaining = cooldownUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
}