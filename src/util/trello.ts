import axios from "axios";

export class TrelloBoard implements Board {
    private readonly key: string = "";
    private readonly token: string = "";
    closed: boolean;
    desc: string;
    id: string;
    idEnterprise: string;
    idOrganization: string;
    labelNames: { [p: string]: string };
    name: string;
    pinned: boolean;
    prefs: Prefs;
    shortUrl: string;
    url: string;

    constructor(key: string, token: string, boardData: any)
    {
        this.key = key;
        this.token = token;
        this.closed = boardData.closed;
        this.desc = boardData.desc;
        this.id = boardData.id;
        this.idEnterprise = boardData.idEnterprise;
        this.idOrganization = boardData.idOrganization;
        this.labelNames = boardData.labelNames;
        this.name = boardData.name;
        this.pinned = boardData.pinned;
        this.prefs = boardData.prefs;
        this.shortUrl = boardData.shortUrl;
        this.url = boardData.url;
    }

    async getUrl(baseUrl: string) : Promise<string>
    {
        const key = this.key;
        const token = this.token;
        let credentials = `${baseUrl.includes("?") ? "&" : "?"}key=${key}&token=${token}`;

        return `https://trello.com/1/${baseUrl}${credentials}`;
    }

    async getList(name: string): Promise<List | undefined> {
        const lists = await this.getLists();
        return lists.find(list => list.name == name);
    }

    async getListById(id: string): Promise<List | undefined> {
        const lists = await this.getLists();
        return lists.find(list => list.id == id);
    }

    async getLists(): Promise<List[]> {
        const response = await axios.get(await this.getUrl(`boards/${this.id}/lists`));
        const data = response.data;
        const lists = [];

        for (const listData of data)
        {
            const list = new TrelloList(this, listData);
            lists.push(list);
        }

        return lists;
    }

    async getListsAndCards(excludeLabels: boolean | undefined): Promise<ListWithCards[]> {
        const cardFilter = `id,name,desc${excludeLabels == true ? "" : ",labels"}`
        const response = await axios.get(await this.getUrl(`boards/${this.id}/lists?filter=open&fields=id,name,cards&cards=open&card_fields=${cardFilter}`));
        return response.data;
    }

    async makeList(name: string, fields: { [name: string]: any } | undefined): Promise<APIMakeCardData> {
        const response = await axios.post(await this.getUrl(`boards/${this.id}/lists`), {
            name: name,
            ...fields
        });

        return response.data;
    }

    async getLabels() : Promise<Label[]>
    {
        const response = await axios.get(await this.getUrl(`boards/${this.id}/labels`));
        return response.data;
    }

    async getLabel(name: string) : Promise<Label | undefined>
    {
        const labels = await this.getLabels();
        return labels.find(label => label.name == name);
    }
}

export class TrelloList implements List
{
    board: Board;
    closed: boolean;
    id: string;
    idBoard: string;
    name: string;
    pos: number;
    softLimit: any;
    status: any;
    subscribed: boolean;

    constructor(board: Board, listData: any)
    {
        this.board = board;
        this.closed = listData.closed;
        this.id = listData.id;
        this.idBoard = listData.idBoard;
        this.name = listData.name;
        this.pos = listData.pos;
        this.softLimit = listData.softLimit;
        this.status = listData.status;
        this.subscribed = listData.subscribed;
    }

    async archiveAllCards(): Promise<boolean> {
        const response = await axios.post(await this.board.getUrl(`lists/${this.id}/archiveAllCards`));
        return Object.keys(response.data).length == 0;
    }

    getBoard(): Board {
        return this.board;
    }

    async getCard(name: string): Promise<Card | undefined> {
        const cards = await this.getCards();
        return cards.find(card => card.name == name);
    }

    async getCards(): Promise<Card[]> {
        const response = await axios.get(await this.board.getUrl(`lists/${this.id}/cards`));
        const cardData = response.data;
        const cards = [];

        for (const data of cardData)
        {
            const card = new TrelloCard(this, data);
            cards.push(card);
        }

        return cards;
    }

    async setArchived(archived: boolean): Promise<APIArchiveListData> {
        const response = await axios.put(await this.board.getUrl(`lists/${this.id}/closed`), {
            value: archived
        })
        return response.data;
    }

    async makeCard(name: string, description: string | undefined, fields: { [name: string]: any } | undefined): Promise<Card> {
        const response = await axios.post(await this.board.getUrl(`cards?idList=${this.id}`), {
            name: name,
            desc: description,
            ...fields
        });

        return new TrelloCard(this, response.data);
    }
}

export class TrelloCard implements Card
{
    list: List
    badges: {
        attachmentsByType: { trello: { board: number; card: number } };
        location: boolean;
        votes: number;
        viewingMemberVoted: boolean;
        subscribed: boolean;
        fogbugz: "";
        checkItems: number;
        checkItemsChecked: number;
        checkItemsEarliestDue: any;
        comments: number;
        attachments: number;
        description: boolean;
        due: any;
        dueComplete: boolean;
        start: any
    };
    cardRole: any;
    checkItemStates: any[];
    closed: boolean;
    cover: Cover;
    dateLastActivity: Date;
    desc: string;
    descData: { emoji: {} };
    due: any;
    dueComplete: boolean;
    dueReminder: any;
    email: string;
    id: string;
    idAttachmentCover: string;
    idBoard: string;
    idChecklists: any[];
    idLabels: string[];
    idList: string;
    idMembers: string[];
    idMembersVoted: any[];
    idShort: number;
    isTemplate: boolean;
    labels: Label[];
    manualCoverAttachment: boolean;
    name: string;
    pos: number;
    shortLink: string;
    shortUrl: string;
    start: any;
    subscribed: boolean;
    url: string;

    constructor(list: List, cardData: any)
    {
        this.list = list;
        this.badges = cardData.badges;
        this.cardRole = cardData.cardRole;
        this.checkItemStates = cardData.checkItemStates;
        this.closed = cardData.closed;
        this.cover =  cardData.cover;
        this.dateLastActivity = cardData.dateLastActivity;
        this.desc = cardData.desc;
        this.descData = cardData.descData;
        this.due = cardData.due;
        this.dueComplete = cardData.dueComplete;
        this.dueReminder = cardData.dueReminder;
        this.email = cardData.email;
        this.id = cardData.id;
        this.idAttachmentCover = cardData.idAttachmentCover;
        this.idBoard = cardData.idBoard;
        this.idChecklists = cardData.idChecklists;
        this.idLabels = cardData.idLabels;
        this.idList = cardData.idList;
        this.idMembers = cardData.idMembers;
        this.idMembersVoted = cardData.idMembersVoted;
        this.idShort = cardData.idShort;
        this.isTemplate = cardData.isTemplate;
        this.labels = cardData.labels;
        this.manualCoverAttachment = cardData.manualCoverAttachment;
        this.name = cardData.name;
        this.pos = cardData.pos;
        this.shortLink = cardData.shortLink;
        this.shortUrl = cardData.shortUrl;
        this.start = cardData.start;
        this.subscribed = cardData.subscribed;
        this.url = cardData.url;
    }

    async addComment(text: string): Promise<Comment> {
        const response = await axios.post(await this.list.board.getUrl(`cards/${this.id}/actions/comments`), {
            text
        });

        return response.data;
    }

    async addLabel(label: Label): Promise<boolean> {
        const response = await axios.post(await this.list.board.getUrl(`cards/${this.id}/idLabels`), {
            value: label.id
        })

        return typeof response.data != "string"
    }

    async deleteCard(): Promise<boolean> {
        const response = await axios.delete(await this.list.board.getUrl(`cards/${this.id}`));
        return response.data;
    }

    async getComments(): Promise<Comment[]> {
        const response = await axios.get(await this.list.board.getUrl(`cards/${this.id}/actions?filter=commentCard`));
        return response.data;
    }

    getList(): List {
        return this.list;
    }

    async removeLabel(label: Label): Promise<boolean> {
        const response = await axios.delete(await this.list.board.getUrl(`cards/${this.id}/idLabels/${label.id}`));
        return response.data._value == null;
    }

    async setArchived(archived: boolean): Promise<APIArchiveListData> {
        const response = await axios.put(await this.list.board.getUrl(`lists/${this.id}/closed`), {
            value: archived
        })
        return response.data;
    }
}

export default class TrelloApi {
    private key: string = "";
    private token: string = "";
    constructor(appKey: string, token: string)
    {
        this.key = appKey;
        this.token = token;
    }

    getUrl = async(baseUrl: string) : Promise<string> =>
    {
        const key = this.key;
        const token = this.token;
        let credentials = `${baseUrl.includes("?") ? "&" : "?"}key=${key}&token=${token}`;

        return `https://trello.com/1/${baseUrl}${credentials}`;
    }

    getBoard = async (boardId: string) : Promise<Board> => {
        const boardData = await axios.get(await this.getUrl(`boards/${boardId}`));
        return new TrelloBoard(this.key, this.token, boardData.data);
    }
}