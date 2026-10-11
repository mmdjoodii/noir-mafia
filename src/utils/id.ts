/** crypto.randomUUID فقط در HTTPS/localhost هست؛ روی گوشی با آدرس شبکه (http) وجود ندارد. */
export const makeId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
