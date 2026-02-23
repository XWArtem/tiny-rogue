export const PERKS = [
    {
        id: "power",
        title: "Additional Claw",
        description: "Attack power +15%",
        apply(hero, enemy) {
            hero.damage = parseFloat((hero.damage * 1.15).toFixed(0));
        }
    },
    {
        id: "rawpower",
        title: "Raw power",
        description: "Attack power +3",
        apply(hero, enemy) {
            hero.damage += 3;
        }
    },
    {
        id: "brutalpower",
        title: "Brutal power",
        description: "Attack power +5",
        apply(hero, enemy) {
            hero.damage += 5;
        }
    },
    {
        id: "smallshield",
        title: "Small Shield",
        description: "Armor +2",
        apply(hero, enemy) {
            hero.armor += 2;
        }
    },
    {
        id: "shield",
        title: "Nice helmet",
        description: "Armor +5",
        apply(hero, enemy) {
            hero.armor += 5;
        }
    },
    {
        id: "ultimatearmor",
        title: "Ultimate Armor",
        description: "Armor +8",
        apply(hero, enemy) {
            hero.armor += 8;
        }
    },
    {
        id: "vampire",
        title: "Vampire",
        description: "Lifesteal +8% (of damage dealt)",
        apply(hero, enemy) {
            hero.lifeSteal += 0.08;
        }
    },
    {
        id: "critchance",
        title: "Beast's Rage",
        description: "Crit strike: +10% chance",
        apply(hero, enemy) {
            hero.critChance += 0.1;
        }
    },
    {
        id: "critpower",
        title: "Beast's Fury",
        description: "Crit strike: damage +50%",
        apply(hero, enemy) {
            hero.critMultiplier += 0.5;
        }
    }
];

export function getRandomPerks(count) {
    const array = [...PERKS];

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array.slice(0, count);
}