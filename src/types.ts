export type ModelType = {
    [key: string]: any; 
    name: string, 
    description: string,
    version: number,
    modules: number,
    model_list: ModelList,
    id?: string,
}

export type ModelList = {
    [key: string]: any; 
    karma?: Module,
    whitelist?: Module,
    ecosystem?: Module,
    scoring?: Module,
    credit_bureau?: Module,
    balance?: Module,
    statement?: Module,
    income?: Module,
}

export type Module = {
    [key: string]: any; 
    required: boolean,
    sequence: number,
    continue_on_failure: boolean,
    minimum?: number,
    provider?: string,
}


export const DEFAULT_MODEL = {
    "karma": {

        "required": true,

        "sequence": 1,

        "continue_on_failure": false

    },

    "whitelist": {

        "required": true,

        "sequence": 2,

        "continue_on_failure": true

    },

    "ecosystem": {

        "required": true,

        "sequence": 3,

        "continue_on_failure": false

    },

    "scoring": {

        "minimum": 50,

        "required": true,

        "sequence": 4,

        "continue_on_failure": false

    },

    "credit_bureau": {

        "provider": "CRC",

        "required": true,

        "sequence": 5,

        "continue_on_failure": false

    },

    "balance": {

        "provider": "mono",

        "required": true,

        "sequence": 6,

        "continue_on_failure": false

    },

    "statement": {

        "provider": "mono",

        "required": true,

        "sequence": 7,

        "continue_on_failure": false

    },

    "income": {

        "provider": "mono",

        "required": false,

        "sequence": 8,

        "continue_on_failure": false

    }
}