import { ServerType, UserType } from '@prisma/client';
import { capitalize } from 'lodash';

export function findHighestType(types: UserType[]): UserType {
  let highest: UserType = 'BOT';
  let highestNum = 0;

  const values = {
    OWNER: 5,
    SUPPORTER: 4,
    CHEATER: 3,
    LEAKER: 2,
    OTHER: 1,
    BOT: 0,
  };

  for (let i = 0; i < types.length; i++) {
    const x = types[i];
    const num = values[x];
    if (x === 'OWNER') {
      highest = 'OWNER';
      highestNum = 0;
    } else if (highestNum < num && x === 'SUPPORTER') {
      highest = 'SUPPORTER';
    } else if (highestNum < num && x === 'CHEATER') {
      highest = 'CHEATER';
    } else if (highestNum < num && x === 'LEAKER') {
      highest = 'LEAKER';
    } else if (highestNum <= num && x === 'OTHER') {
      highest = 'OTHER';
    } else if (highestNum <= num && x === 'BOT') {
      highest = 'BOT';
    }
    highestNum = num;
  }
  return highest;
}

export function findHighestServerType(types: ServerType[]): UserType {
  let highest: UserType = 'BOT';
  let highestNum = 0;

  const values = {
    CHEATING: 5,
    LEAKING: 4,
    RESELLING: 3,
    ADVERTISING: 2,
    OTHER: 1,
    BOT: 0,
  };

  for (let i = 0; i < types.length; i++) {
    const x = types[i];
    const num = values[x];
    if (highestNum < num && x === 'CHEATING') {
      highest = 'CHEATER';
    } else if (highestNum < num && x === 'LEAKING') {
      highest = 'LEAKER';
    } else if (highestNum <= num && (x === 'RESELLING' || x === 'ADVERTISING' || x === 'OTHER')) {
      highest = 'OTHER';
    }
    highestNum = num;
  }
  return highest;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAnyType(enumeration: any) {
  const map = enumToMap(enumeration);
  const choices = Array.from(map.entries()).map((m) => {
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
