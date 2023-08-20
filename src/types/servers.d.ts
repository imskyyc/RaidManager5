declare interface IServer
{
    job_id: string
    token: string,
    game_name: string
    place_id: string
    is_vip: number
    last_ping: number,
    created_at: Date,
    updated_at: Date
}