
module.exports = configSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        mode: {
            type: 'string',
        },
        apis: {
            type: 'array',
            additionalProperties: true,
            items: {
                title: 'apis',
                description: 'APIs list',
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                },
            },
            required: ['name'],
        },

    },
    required: ['mode'],
    errorMessage: {
        properties: {
            index: `The mode property is missing at the .labsharerc file`,
        },
    }
}
