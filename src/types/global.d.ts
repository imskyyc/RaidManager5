declare interface ICommand 
{
    name: Lowercase<string>;
    description: string;
    defaultMemberPermissions?: string | number | bigint | null | undefined;
    subcommands?: ICommand[];
    options?: ApplicationCommandOptionBase[];
    developer?: boolean;

    isIndexer?: boolean;
    guardsman: Guardsman;

    execute(interaction: ChatInputCommandInteraction<"cached">) : Promise<void>;
}

declare interface IEvent 
{
    name: string,
    function: () => Promise<void>
}

