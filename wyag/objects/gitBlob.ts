import { GitObject } from "../gitObject"
import { GitType } from "../gitType"

export class GitBlob extends GitObject {
    blobData: Buffer

    constructor(data: Buffer) {
        super()
        this.blobData = data
    }

    static fromSerialized(data: Buffer): GitBlob {
        return new GitBlob(data)
    }

    static fromSource(buf: Buffer): GitBlob {
        return new GitBlob(buf)
    }

    serializeOwnData(): Buffer {
        return this.blobData
    }

    getType(): GitType {
        return 'blob'
    }
}