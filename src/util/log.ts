import chalk from "chalk";
import { Guardsman } from "../index.js";
import moment from "moment";

export default class Logger 
{
    name: string;
    guardsman: Guardsman;

    constructor(name: string, guardsman: Guardsman)
    {
        this.name = name;
        this.guardsman = guardsman;
    }

    _base = async (type: string, ...args: any[]) => 
    {
        console.log(
            `${chalk.gray("[")} ${chalk.blueBright(this.name)} ${chalk.gray(":")} ${type} ${chalk.gray("]")}` + 
            `${chalk.gray("[")} ${chalk.greenBright(moment().format("hh:mm:ss"))} ${chalk.gray("]")}` + 
            `: ${args.join(", ")}`
        )
    }

    info = async (...args: any[]) =>
    {
        await this._base(chalk.blueBright("INFO"), ...args);
    }

    warn = async (...args: any[]) =>
    {
        await this._base(chalk.yellowBright("WARN"), ...args);
    }

    error = async (...args: any[]) =>
    {
        await this._base(chalk.redBright("ERROR"), ...args);
    }

    critical = async (...args: any[]) =>
    {
        await this._base(chalk.red("CRITICAL"), ...args);
    }

    debug = async (...args: any[]) =>
    {
        if (!this.guardsman.debug) return;
        await this._base(chalk.greenBright("DEBUG"), ...args);
    }
    
}