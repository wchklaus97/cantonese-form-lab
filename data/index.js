import { routines as routineList } from "./routines.js";
import { exercises as arms } from "./exercises/arms.js";
import { exercises as chest } from "./exercises/chest.js";
import { exercises as back } from "./exercises/back.js";
import { exercises as thighs } from "./exercises/thighs.js";
import { exercises as backGold } from "./exercises/back-gold.js";
import { exercises as home } from "./exercises/home.js";

export const routines = routineList;
export const exercises = [...arms, ...chest, ...back, ...thighs, ...backGold, ...home];
