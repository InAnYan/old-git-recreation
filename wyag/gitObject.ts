import { GitType } from "./gitType"

export abstract class GitObject {
    abstract serializeOwnData(): Buffer
    abstract getType(): GitType

    serialize(): Buffer {
        let data = this.serializeOwnData()
        let str = this.getType() + ' ' + data.length.toString() + '\0' + data
        return Buffer.from(str)
    }
}
