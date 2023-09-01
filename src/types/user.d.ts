declare interface IUser
{
    id?: number
    username: string
    roblox_id: string
    discord_id: string
    password: string
    remember_token: string
    roles: string
    created_at?: Date
    updated_at?: Date
}

declare interface IRole
{
    name: string
    position: number
    permissions: string
}

declare interface IVerificationConfirmation
{
    discord_id: string
    token: string
}

declare interface IRoleBind
{
    id: number,
    guild_id: string,
    role_id: string,
    role_data: string
}

declare type RoleDataGroupBind =
{
    groupId?: number
    minRank?: number,
    maxRank?: number,
}

declare type RoleDataUserBind =
{
    userId?: string
}

declare type RoleDataGamePassBind =
{
    gamepassId?: number
}

declare type RoleData<T> =
{
    type: string
} & T

declare type EventImportData = {
    [pointValue: number]: string[]
}

declare type Userdata =
{
    user_id: string,
    in_squadron: number,
    events_attended: number,
    squadron_events_attended: number,
    squadron_last_promoted?: Date,
    squadron_medals: string,
    squadron_loa_start_date?: Date,
}

declare type StoredUserdata =
{
    created_at: Date,
    updated_at: Date
} & Userdata