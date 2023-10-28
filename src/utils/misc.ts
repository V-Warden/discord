import axios from 'axios';
import FormData from 'form-data';

export function generateErrorID(): string {
    return (Math.random() + 1).toString(36).substring(3);
}

export function capitalize(string: string): string {
    var toReturn = string
    try {
        toReturn = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    } catch (e) {
        toReturn = string
    }

    return toReturn
}

export function formatSeconds(seconds: number) {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    const time = [];
    if (hours >= 1) time.push(`${hours}h`);
    if (minutes >= 1) time.push(`${minutes}m`);
    if (seconds >= 1) time.push(`${secs}s`);

    return time.join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enumToMap(enumeration: any): Map<string, string | number> {
    const map = new Map<string, string | number>();
    for (const key in enumeration) {
        if (!isNaN(Number(key))) continue;
        const val = enumeration[key] as string | number;
        if (val !== undefined && val !== null) map.set(key, val);
    }
    return map;
}

export function mapAnyType(enumeration: any) {
    const map = enumToMap(enumeration);
    const choices = Array.from(map.entries()).map(m => {
        let x = m[0];
        if (x.includes('_')) {
            const split = x.split('_');
            x = `${capitalize(split[0])}${capitalize(split[1])}`;
        } else x = capitalize(x);
        return {
            name: x,
            value: `${m[1]}`,
        };
    });

    return choices;
}

export async function uploadText(text: string, time: string) {
    try {
        const formData = new FormData();

        formData.append('lang', 'json');
        formData.append('expire', time);
        formData.append('password', '');
        formData.append('title', '');
        formData.append('text', text);

        const response = await axios.request({
            url: 'https://paste.iitranq.co.uk/paste/new',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: formData,
        });

        return response.request.res.responseUrl;
    } catch (e) {
        console.log(e);
        return;
    }
}
