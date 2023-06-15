import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { SerpAPI } from 'langchain/tools'

class SerpAPI_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Serp API'
        this.name = 'serpAPI'
        this.type = 'SerpAPI'
        this.icon = 'serp.png'
        this.category = '工具'
        this.description = '基于 SerpAPI 的包装器 - 一个用于访问Google搜索结果的实时API'
        this.inputs = [
            {
                label: 'Serp Api Key',
                name: 'apiKey',
                type: 'password',
                default: process.env.SERP_API_KEY,
            }
        ]
        this.baseClasses = [this.type, ...getBaseClasses(SerpAPI)]
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string
        return new SerpAPI(apiKey, {
            location: "Austin,Texas,United States",
            hl: "zh-cn",
            gl: "cn",
          })
    }
}

module.exports = { nodeClass: SerpAPI_Tools }
