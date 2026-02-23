export class Character {
    constructor(name, options = {}) {
        this.name = name;

        this.maxHp = options.hp ?? 50;
        this.hp = this.maxHp;
        this.damage = options.damage ?? 5;

        this.critChance = options.critChance ?? 0;
        this.critMultiplier = options.critMultiplier ?? 1.5;

        this.lifeSteal = options.lifeSteal ?? 0;
        this.armor = options.armor ?? 0;
    }

    attack(target) {
        let dmg = this.damage;
        let isCritical = false;

        if (Math.random() < this.critChance) {
            dmg *= this.critMultiplier;
            isCritical = true;
        }

        dmg = parseFloat(dmg.toFixed(1));

        let damageToHp = 0;
        let damageToShield = 0;

        if (target.armor > 0) {
            if (target.armor >= dmg) {
                target.armor -= dmg;
                target.armor = parseFloat(target.armor.toFixed(1));
                damageToShield = dmg;
                dmg = 0;
            } else {
                damageToShield = target.armor;
                dmg -= target.armor;
                target.armor = 0;
                damageToHp = dmg;
            }
        } else {
            damageToHp = dmg;
        }

        target.hp -= damageToHp;
        target.hp = parseFloat(target.hp.toFixed(1));

        if (this.lifeSteal > 0) {
            const heal = damageToHp * this.lifeSteal;
            this.hp += heal;
            this.hp = Math.min(this.hp, this.maxHp);
            this.hp = parseFloat(this.hp.toFixed(1));
        }

        const totalDamage = damageToHp + damageToShield;
        return { damageDealt: totalDamage, damageToHp, targetHp: target.hp, targetArmor: target.armor, damageToShield, isCritical };
    }

    isAlive() {
        return this.hp > 0;
    }
}