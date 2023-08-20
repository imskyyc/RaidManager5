import { ChatInputCommandInteraction, Client, Collection, IntentsBitField, REST, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Guardsman } from "../index.js";
import { readdir, lstat } from "fs/promises";
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default class Bot extends Client
{
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        super({
            intents: [
                IntentsBitField.Flags.AutoModerationConfiguration,
                IntentsBitField.Flags.AutoModerationExecution,
                IntentsBitField.Flags.DirectMessageReactions,
                IntentsBitField.Flags.DirectMessageTyping,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.GuildEmojisAndStickers,
                IntentsBitField.Flags.GuildIntegrations,
                IntentsBitField.Flags.GuildInvites,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMessageTyping,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.GuildPresences,
                IntentsBitField.Flags.GuildScheduledEvents,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildWebhooks,
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.MessageContent
            ]
        });

        this.guardsman = guardsman;

        this.commands.push();
        this.events.load();
        this.login(this.guardsman.environment.DISCORD_BOT_TOKEN);
    }

    pendingVerificationInteractions: { [discordId: string]: ChatInputCommandInteraction<"cached"> } = {}

    commands = {
        list: new Collection<string, Collection<string, ICommand>>(),

        read: async (): Promise<Collection<string, Collection<string, ICommand>>> =>
        {
            const categoryDirs = await readdir(`${__dirname}/commands`);
            const commandList = new Collection<string, Collection<string, ICommand>>();

            for (const categoryDir of categoryDirs)
            {
                const category = new Collection<string, ICommand>();
                const commandFiles = await readdir(`${__dirname}/commands/${categoryDir}`);

                for (const commandFile of commandFiles)
                {
                    const commandFileStat = await lstat(`${__dirname}/commands/${categoryDir}/${commandFile}`);
                    const commandClass = (await import(`./commands/${categoryDir}/${commandFile}${commandFileStat.isDirectory() && "/index.js" || ""}`)).default;
                    const commandData: ICommand = new commandClass(this.guardsman);
                    
                    if (commandFileStat.isDirectory())
                    {
                        if (!commandData.subcommands)
                        {
                            commandData.subcommands = [];
                        }

                        commandData.isIndexer = true;
                    }
                    
                    category.set(commandData.name, commandData);
                }

                commandList.set(categoryDir, category);
            }

            return commandList;
        },

        push: async () => {
            const commandsList = await this.commands.read();
            this.commands.list = commandsList;

            const parsedCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
            
            for (const categoryName of commandsList.keys())
            {
                const category = commandsList.get(categoryName);
                if (!category) {
                    this.guardsman.log.error(`Category is null! ${categoryName}`)
                    continue;
                }

                for (const command of category.values())
                {
                    const slashCommand = new SlashCommandBuilder();

                    slashCommand.setName(command.name);
                    slashCommand.setDescription(command.description);
                    slashCommand.setDefaultMemberPermissions(command.defaultMemberPermissions);

                    for (const option of command.options || [])
                    {
                        slashCommand.options.push(option);
                    }

                    if (command.isIndexer)
                    {
                        const subCommandFiles = await readdir(`${__dirname}/commands/${categoryName}/${command.name}`);

                        for (const subCommandFile of subCommandFiles)
                        {
                            if (subCommandFile.includes("index.")) continue;

                            const subCommandClass = (await import(`./commands/${categoryName}/${command.name}/${subCommandFile}`)).default;
                            const subCommandData: ICommand = new subCommandClass(this.guardsman);

                            const subCommand = new SlashCommandSubcommandBuilder();
                            
                            subCommand.setName(subCommandData.name);
                            subCommand.setDescription(subCommandData.description);
                            
                            for (const option of subCommandData.options || []) {
                                subCommand.options.push(option);
                            }

                            command.subcommands?.push(subCommandData);

                            slashCommand.addSubcommand(subCommand);
                        }
                    }

                    parsedCommands.push(slashCommand.toJSON())
                }
            }

            const DiscordAPI = new REST();
            DiscordAPI.setToken(this.guardsman.environment.DISCORD_BOT_TOKEN);
            await DiscordAPI.put(Routes.applicationCommands(
                this.guardsman.environment.DISCORD_BOT_CLIENT_ID
            ), {
                body: parsedCommands
            })
        }
    }

    events = {
        functions: {},

        read: async () => 
        {
            const eventFiles = await readdir(`${__dirname}/events`);
            const events: IEvent[] = []

            for (const eventFile of eventFiles)
            {
                const eventFunction = (await import(`./events/${eventFile}`)).default;

                events.push({
                    name: eventFile.replace(/\.[^/.]+$/, ""),
                    function: eventFunction.bind(null, this.guardsman)
                });
            }

            return events;
        },

        load: async () =>
        {
            const events = await this.events.read();
            this.events.functions = events;

            for (const event of events)
            {
                this.on(event.name, event.function);
            }
        }
    }
}