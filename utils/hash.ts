import crypto from 'crypto';

export function hashUserId(userId: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(userId);
    return hash.digest('hex');
}