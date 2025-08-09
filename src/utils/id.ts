// Generate MongoDB-like ObjectId strings for the frontend
export function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('').slice(0, 16);
  
  return timestamp + randomBytes;
}
