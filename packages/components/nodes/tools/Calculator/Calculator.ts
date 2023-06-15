import { INode } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Calculator } from 'langchain/tools/calculator'

class Calculator_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]

    constructor() {
        this.label = 'Calculator'
        this.name = 'calculator'
        this.type = 'Calculator'
        this.icon = 'calculator.svg'
        this.category = '工具'
        this.description = '对响应执行计算'
        this.baseClasses = [this.type, ...getBaseClasses(Calculator)]
    }

    async init(): Promise<any> {
        return new Calculator()
    }
}

module.exports = { nodeClass: Calculator_Tools }
