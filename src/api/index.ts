import express, { Express, NextFunction, Request, Response } from "express";
import { readdir, lstat } from "fs/promises";
import { Guardsman } from "index";
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type APIObject<T> = {
    list: T,

    parseDirectory: (path: string) => Promise<void>
    read: () => Promise<void>
}

type IRoutesList = { [path: string]: (request: Request, response: Response) => Promise<void> }
type IMiddlewareList = { [path: string]: (request: Request, response: Response, next: NextFunction) => Promise<void> }

export default class API
{
    guardsman: Guardsman;
    server: Express;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
        this.server = express();
        this.middleware.read()
            .then(() => { guardsman.log.info("Middleware read successfully.") })
            .then(this.routes.read)
            .then(() => { guardsman.log.info("Routes read successfully.") })
            .then(() =>
            {
                this.server.get("/", (_, res) => {
                    res.json({ success: true, status: "RaidManager API online and ready." })
                })
            })
            .then(() =>
            {
                this.server.listen(guardsman.environment.API_PORT);
            })
    }
    
    routes: APIObject<IRoutesList> = {
        list: {},

        parseDirectory: async (path: string) =>
        {
            const routeFiles = await readdir(path);
        
            for (let routeFile of routeFiles)
            {
                const dirStats = await lstat(`${path}/${routeFile}`);

                if (dirStats.isDirectory())
                {
                    await this.routes.parseDirectory(`${path}/${routeFile}`);
                }
                else
                {
                    
                    const routeFunction = ((await import(`.${path.replace(__dirname, "")}/${routeFile}`)).default).bind(null, this.guardsman);
                    
                    routeFile = routeFile.replace(/\.[^/.]+$/, "");
                    const nameComponents = routeFile.split(".");
                    const method = nameComponents[nameComponents.length - 1];
                    const route = (`${path.replace(`${__dirname}/routes`, "")}/${routeFile}`).replace(`.${method}`, "");

                    switch (method)
                    {
                        case "get":
                            this.server.get(route, routeFunction);
                            break;
                        case "post":
                            this.server.post(route, routeFunction);
                            break;
                        case "delete":
                            this.server.delete(route, routeFunction);
                            break;
                        case "patch":
                            this.server.patch(route, routeFunction);
                            break;
                    }
                }
            }
        },

        read: async () =>
        {
            await this.routes.parseDirectory(`${__dirname}/routes`)
        }
    };

    middleware: APIObject<IMiddlewareList> = {
        list: {},

        parseDirectory: async (path: string) =>
        {
            const middlewareFiles = await readdir(path);

            for (let middlewareFile of middlewareFiles)
            {
                const dirStats = await lstat(`${path}/${middlewareFile}`);

                if (dirStats.isDirectory())
                {
                    await this.routes.parseDirectory(`${path}/${middlewareFile}`);
                }
                else
                {

                    const middlewareFunction = ((await import(`.${path.replace(__dirname, "")}/${middlewareFile}`)).default).bind(null, this.guardsman);
                    this.server.use(middlewareFunction);
                }
            }
        },

        read: async() =>
        {
            await this.middleware.parseDirectory(`${__dirname}/middleware`);
        }

    }
}