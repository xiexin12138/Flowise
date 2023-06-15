import { ICommonObject, INode, INodeData, INodeParams, PromptTemplate } from '../../../src/Interface'
import { getBaseClasses, getInputVariables, returnJSONStr } from '../../../src/utils'
import { PromptTemplateInput } from 'langchain/prompts'

class PromptTemplate_Prompts implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Prompt Template'
        this.name = 'promptTemplate'
        this.type = 'PromptTemplate'
        this.icon = 'prompt.svg'
        this.category = '提示词'
        this.description = '表示大语言模型基本提示词的模板结构'
        this.baseClasses = [...getBaseClasses(PromptTemplate)]
        this.inputs = [
            {
                label: 'Template',
                name: 'template',
                type: 'string',
                rows: 4,
                placeholder: `What is a good name for a company that makes {product}?`
            },
            {
                label: 'Format Prompt Values',
                name: 'promptValues',
                type: 'string',
                rows: 4,
                placeholder: `{
  "input_language": "English",
  "output_language": "French"
}`,
                optional: true,
                acceptVariable: true,
                list: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const template = nodeData.inputs?.template as string
        let promptValuesStr = nodeData.inputs?.promptValues as string

        let promptValues: ICommonObject = {}
        if (promptValuesStr) {
            promptValuesStr = promptValuesStr.replace(/\s/g, '')
            promptValues = JSON.parse(returnJSONStr(promptValuesStr))
        }

        const inputVariables = getInputVariables(template)

        try {
            const options: PromptTemplateInput = {
                template,
                inputVariables
            }
            console.log('🚀 options', options);
            
            const prompt = new PromptTemplate(options)
            prompt.promptValues = promptValues
            return prompt
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = { nodeClass: PromptTemplate_Prompts }
