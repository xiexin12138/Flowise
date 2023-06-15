import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { PineconeClient } from '@pinecone-database/pinecone'
import { PineconeLibArgs, PineconeStore } from 'langchain/vectorstores/pinecone'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'
import { flatten } from 'lodash'

class PineconeUpsert_VectorStores implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Pinecone Upsert Document'
        this.name = 'pineconeUpsert'
        this.type = 'Pinecone'
        this.icon = 'pinecone.png'
        this.category = '向量存储'
        this.description = '将文档插值更新到Pinecone中。'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: 'Document',
                name: 'document',
                type: 'Document',
                list: true
            },
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Pinecone Api Key',
                name: 'pineconeApiKey',
                type: 'password',
                default: process.env.PINECONE_API_KEY
            },
            {
                label: 'Pinecone Environment',
                name: 'pineconeEnv',
                type: 'string',
                default: process.env.PINECONE_ENVIRONMENT
            },
            {
                label: 'Pinecone Index',
                name: 'pineconeIndex',
                type: 'string',
                default: process.env.PINECONE_INDEX
            },
            {
                label: 'Pinecone Namespace',
                name: 'pineconeNamespace',
                type: 'string',
                placeholder: 'my-first-namespace',
                additionalParams: true,
                optional: true,
                default: process.env.PINECONE_NAMESPACE
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Pinecone Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Pinecone Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(PineconeStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const pineconeApiKey = nodeData.inputs?.pineconeApiKey as string
        const pineconeEnv = nodeData.inputs?.pineconeEnv as string
        const index = nodeData.inputs?.pineconeIndex as string
        const pineconeNamespace = nodeData.inputs?.pineconeNamespace as string
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const client = new PineconeClient()
        await client.init({
            apiKey: pineconeApiKey,
            environment: pineconeEnv
        })

        const pineconeIndex = client.Index(index)

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const obj: PineconeLibArgs = {
            pineconeIndex
        }

        if (pineconeNamespace) obj.namespace = pineconeNamespace

        const vectorStore = await PineconeStore.fromDocuments(finalDocs, embeddings, obj)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k)
            return retriever
        } else if (output === 'vectorStore') {
            ;(vectorStore as any).k = k
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: PineconeUpsert_VectorStores }
