// Boards
export interface Board
{
    id: string
    name: string
    desc: string
    closed: boolean
    idOrganization?: string
    idEnterprise?: string
    pinned: boolean
    url: string
    shortUrl: string
    prefs: Prefs
    labelNames: { [color: string]: string }
}

export interface Prefs
{
    permissionLevel: "private" | "public"
    hideVotes: boolean
    voting: "disabled" | "enabled"
    comments: "members"
    invitations: "members"
    selfJoin: boolean
    cardCovers: boolean
    isTemplate: boolean
    cardAging: "regular"
    calendarFeedEnabled: boolean
    hiddenPluginBoardButtons: string[]
    switcherViews: SwitcherView[]
    background: string
    backgroundColor?: string
    backgroundImage: string
    backgroundImageScaled: ScaledBackgroundImage[]
    backgroundTile: boolean
    backgroundBrightness: string
    backgroundBottomColor: string
    backgroundTopColor: string
    canBePublic: boolean
    canBeEnterprise: boolean
    canBeOrg: boolean
    canBePrivate: boolean
    canInvite: boolean
}

export interface SwitcherView
{
    viewType: string
    enabled: boolean
}

export interface ScaledBackgroundImage
{
    width: number
    height: number
    url: string
}

// Lists
export interface List
{
    id: string
    name: string
    closed: boolean
    idBoard: string
    pos: number
    subscribed: boolean
    softLimit?: any
    status?: any
}

export interface ListWithCards
{
    id: string
    name: string
    cards: ListAPICard[]
}

// Cards
export interface ListAPICard
{
    id: string
    name: string
    desc: string
    labels: Label[]
}

export interface APIMakeCardData
{
    id: string
    name: string
    closed: boolean
    idBoard: string
    pos: number
    status: any
    limits: { [any]: any }
}

export interface Card
{
    id: string
    badges: {
        attachmentsByType: {
            trello: {
                board: number
                card: number
            }
        }

        location: boolean
        votes: number
        viewingMemberVoted: boolean
        subscribed: boolean
        fogbugz: "" //????
        checkItems: number
        checkItemsChecked: number
        checkItemsEarliestDue: any
        comments: number
        attachments: number
        description: boolean
        due: any
        dueComplete: boolean
        start: any
    }

    checkItemStates: any[]
    closed: boolean
    dueComplete: boolean
    dateLastActivity: Date
    desc: string
    descData: {
        emoji: { [any]: any }
    }
    due: any
    dueReminder: any
    email: string
    idBoard: string
    idChecklists: any[]
    idList: string
    idMembers: string[]
    idMembersVoted: any[]
    idShort: number
    idAttachmentCover: string
    labels: Label[]
    idLabels: string[]
    manualCoverAttachment: boolean
    name: string
    pos: number
    shortLink: string
    shortUrl: string
    start: any
    subscribed: boolean
    url: string
    cover: Cover
    isTemplate: boolean
    cardRole: any
}

export interface Label
{
    id: string
    idBoard: string
    name: string
    color: string
    uses: number
}

export interface Cover
{
    idAttachment: string
    color: any
    idUploadedBackground: any
    size: string
    brightness: string
    idPlugin: any
}