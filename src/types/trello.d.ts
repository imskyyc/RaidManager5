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

    getUrl: (baseUrl: string) => Promise<string>
    getLabels: () => Promise<Label[]>
    getLabel: (name: string) => Promise<Label | undefined>
    getLists: () => Promise<List[]>
    getList: (name: string) => Promise<List | undefined>
    getListById: (id: string) => Promise<List | undefined>
    getListsAndCards: (excludeLabels?: boolean) => Promise<ListWithCards[]>
    makeList: (name: string, fields?: { [name: string]: any }) => Promise<APIMakeCardData>
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
    board: Board
    id: string
    name: string
    closed: boolean
    idBoard: string
    pos: number
    subscribed: boolean
    softLimit?: any
    status?: any

    getCards: () => Promise<Card[]>
    getBoard: () => Board
    getCard: (name: string) => Promise<Card | undefined>
    archiveAllCards: () => Promise<boolean>
    setArchived: (archived: boolean) => Promise<APIArchiveListData>
    makeCard: (name: string, description?: string, fields?: { [name: string]: any}) => Promise<Card>
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

export interface APIArchiveListData
{
    id: string
    name: string
    closed: boolean
    idBoard: string
    pos: number
    status?: any
}

export interface Card
{
    id: string
    list: List
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

    getList: () => List
    setArchived: (archived: boolean) => Promise<APIArchiveListData>
    deleteCard: () => Promise<boolean>
    getComments: () => Promise<Comment[]>
    addComment: (text: string) => Promise<Comment>
    addLabel: (label: Label) => Promise<boolean>
    removeLabel: (label: Label) => Promise<boolean>
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

export interface Comment
{
    id: string
    idMemberCreator: string
    data: {
        text: string
        textData: { emoji: { [any]: any } }
        card: Card
        board: Board
        list: List
    }

    appCreator: {
        id: string
    }
    type: string
    date: Date
    limits: {
        reactions: {
            perAction: any
            uniquePerAction: any
        }
    }
    display: {
        translationKey: string
        entities: {
            contextOn: any

        }
    }
    entities: any[]
    memberCreator: {
        id: string
        activityBlocked: boolean
        avatarHash: string
        avatarUrl: string
        fullName: string
        idMemberReferrer: any
        initials: string
        nonPublic: any
        nonPublicAvailable: boolean
        username: string
    }

    deleteComment: () => Promise<boolean>
    updateComment: (text: string) => Promise<Comment>
}