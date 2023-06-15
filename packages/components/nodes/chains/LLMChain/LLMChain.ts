import { ICommonObject, INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { CustomChainHandler, getBaseClasses } from '../../../src/utils'
import { LLMChain } from 'langchain/chains'
import { BaseLanguageModel } from 'langchain/base_language'

class LLMChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'LLM Chain'
        this.name = 'llmChain'
        this.type = 'LLMChain'
        this.icon = 'chain.svg'
        this.category = '链'
        this.description = '用于对大语言模型运行查询的链'
        this.baseClasses = [this.type, ...getBaseClasses(LLMChain)]
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'BasePromptTemplate'
            },
            {
                label: 'Chain Name',
                name: 'chainName',
                type: 'string',
                placeholder: 'Name Your Chain',
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'LLM Chain',
                name: 'llmChain',
                baseClasses: [this.type, ...getBaseClasses(LLMChain)]
            },
            {
                label: 'Output Prediction',
                name: 'outputPrediction',
                baseClasses: ['string']
            }
        ]
    }

    async init(nodeData: INodeData, input: string): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const prompt = nodeData.inputs?.prompt
        const output = nodeData.outputs?.output as string
        const promptValues = prompt.promptValues as ICommonObject

        if (output === this.name) {
            const chain = new LLMChain({ llm: model, prompt, verbose: process.env.DEBUG === 'true' ? true : false })
            return chain
        } else if (output === 'outputPrediction') {
            const chain = new LLMChain({ llm: model, prompt, verbose: process.env.DEBUG === 'true' ? true : false })
            const inputVariables = chain.prompt.inputVariables as string[] // ["product"]
            const res = await runPrediction(inputVariables, chain, input, promptValues)
            // eslint-disable-next-line no-console
            console.log('\x1b[92m\x1b[1m\n*****OUTPUT PREDICTION*****\n\x1b[0m\x1b[0m')
            // eslint-disable-next-line no-console
            console.log(res)
            return res
        }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const inputVariables = nodeData.instance.prompt.inputVariables as string[] // ["product"]
        const chain = nodeData.instance as LLMChain
        const promptValues = nodeData.inputs?.prompt.promptValues as ICommonObject

        const res = options.socketIO
            ? await runPrediction(inputVariables, chain, input, promptValues, true, options.socketIO, options.socketIOClientId)
            : await runPrediction(inputVariables, chain, input, promptValues)
        // eslint-disable-next-line no-console
        console.log('\x1b[93m\x1b[1m\n*****FINAL RESULT*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        console.log(res)
        return res
    }
}

const runPrediction = async (
    inputVariables: string[],
    chain: LLMChain,
    input: string,
    promptValues: ICommonObject,
    isStreaming?: boolean,
    socketIO?: any,
    socketIOClientId = ''
) => {
    if (inputVariables.length === 1) {
        if (isStreaming) {
            const handler = new CustomChainHandler(socketIO, socketIOClientId)
            const res = await chain.run(input, [handler])
            return res
        } else {
            const res = await chain.run(input)
            return res
        }
    } else if (inputVariables.length > 1) {
        let seen: string[] = []

        for (const variable of inputVariables) {
            seen.push(variable)
            if (promptValues[variable]) {
                seen.pop()
            }
        }

        if (seen.length === 0) {
            // All inputVariables have fixed values specified
            const options = {
                ...promptValues
            }
            if (isStreaming) {
                const handler = new CustomChainHandler(socketIO, socketIOClientId)
                const res = await chain.call(options, [handler])
                return res?.text
            } else {
                const res = await chain.call(options)
                return res?.text
            }
        } else if (seen.length === 1) {
            // If one inputVariable is not specify, use input (user's question) as value
            const lastValue = seen.pop()
            if (!lastValue) throw new Error('Please provide Prompt Values')
            const options = {
                ...promptValues,
                [lastValue]: input
            }
            if (isStreaming) {
                const handler = new CustomChainHandler(socketIO, socketIOClientId)
                const res = await chain.call(options, [handler])
                return res?.text
            } else {
                const res = await chain.call(options)
                return res?.text
            }
        } else {
            throw new Error(`Please provide Prompt Values for: ${seen.join(', ')}`)
        }
    } else {
        if (isStreaming) {
            const handler = new CustomChainHandler(socketIO, socketIOClientId)
            const res = await chain.run(input, [handler])
            return res
        } else {
            const res = await chain.run(input)
            return res
        }
    }
}

module.exports = { nodeClass: LLMChain_Chains }
