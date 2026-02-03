export default function generateAlias(userId) {
  // Generate a unique alias using userId and random string
  const randomPart = Math.random().toString(36).substring(2, 8);
  const userIdPart = userId ? userId.toString().slice(-4) : '';
  return `mask_${userIdPart}${randomPart}@maskme.dev`;
}

