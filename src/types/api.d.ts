declare type IScheduleEvent =
{
    host: string,
    name: string,
    type: "raid" | "training" | "tryout" | "eval" | "rally",
    length: number,
    date: number,
    notes: string
}

declare type IScheduledEvent =
{
    id: number
} & IScheduleEvent