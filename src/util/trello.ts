import axios from "axios";
import {APIMakeCardData, Board, List, ListWithCards} from "../types/trello";

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

    boards = {
        getBoard: async (boardId: string) : Promise<Board> =>
        {
            const response = await axios.get(await this.getUrl(`boards/${boardId}`));
            return response.data;
        },

        getLists: async (board: Board) : Promise<List[]> =>
        {
            const response = await axios.get(await this.getUrl(`boards/${board.id}/lists`));
            return response.data;
        },

        getListsAndCards: async (board: Board, excludeLabels?: boolean) : Promise<ListWithCards[]> => {
            const cardFilter = `id,name,desc${excludeLabels == true ? "" : ",labels"}`
            const response = await axios.get(await this.getUrl(`boards/${board.id}/lists?filter=open&fields=id,name,cards&cards=open&card_fields=${cardFilter}`));
            return response.data;
        },

        makeList: async (board: Board, name: string, fields?: { [name: string]: any }) : Promise<APIMakeCardData> =>
        {
            const response = await axios.post(await this.getUrl(`boards/${board.id}/lists`), {
                name: name,
                ...fields
            });

            return response.data;
        }
    }

    lists = {

    }

    cards = {

    }
}