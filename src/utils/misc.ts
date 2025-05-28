import axios from 'axios'
import logger from './logger'

export function generateErrorID(): string {
    return (Math.random() + 1).toString(36).substring(3)
}

export function capitalize(string: string): string {
    var toReturn = string
    try {
        toReturn = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    } catch (e) {
        toReturn = string
    }

    return toReturn
}

export function getTime(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.0`;
  }

export function formatSeconds(seconds: number) {
    const hours = Math.floor(seconds / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    const secs = Math.floor(seconds % 60)
    const time = []
    if (hours >= 1) time.push(`${hours}h`)
    if (minutes >= 1) time.push(`${minutes}m`)
    if (seconds >= 1) time.push(`${secs}s`)

    return time.join(' ')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enumToMap(enumeration: any): Map<string, string | number> {
    const map = new Map<string, string | number>()
    for (const key in enumeration) {
        if (!isNaN(Number(key))) continue
        const val = enumeration[key] as string | number
        if (val !== undefined && val !== null) map.set(key, val)
    }
    return map
}

export function mapAnyType(enumeration: any) {
    const map = enumToMap(enumeration)
    const choices = Array.from(map.entries()).map(m => {
        let x = m[0]
        if (x.includes('_')) {
            const split = x.split('_')
            x = `${capitalize(split[0])}${capitalize(split[1])}`
        } else x = capitalize(x)
        return {
            name: x,
            value: `${m[1]}`,
        }
    })

    return choices
}

export async function uploadText(text: string, time: string) {
    try {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        const formattedDate = oneHourFromNow.toISOString().replace('T', ' ').slice(0, 19);
        const payload = {
            type: 'PASTE',
            title: 'uinfo.json',
            content: text,
            visibility: 'UNLISTED',
            encrypted: false,
            expire_at: formattedDate,
          };
          
          const response = await axios.post(
            'https://paste.iitranq.co.uk/api/v2/paste',
            payload,
            { headers: { 'Content-Type': 'application/json' } }
          );
            const pasteId = response.data.paste.id;
            const fullUrl = `https://paste1.iitranq.co.uk/${pasteId}`;
            return fullUrl;
        } catch (e) {
            logger.error({
                labels: { event: 'uploadText' },
                message: e,
            })
            return
        }
    }
