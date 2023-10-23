import * as zlib from 'zlib'
import * as crypto from 'crypto'
import { GitObject } from "./gitObject"
import { GitObjectReader } from './gitObjectReader'
import { Path } from './path'

export class GitObjectFile {
    compressed: Buffer
    sha: string

    constructor(obj: GitObject) {
        let serialized = obj.serialize()
        this.compressed = zlib.gzipSync(serialized)
        this.sha = calculateSHA1(this.compressed)
    }

    static fromBufferToObject(buf: Buffer): GitObject {
        let serialized = zlib.unzipSync(buf)
        return GitObjectReader.fromSerialized(serialized) 
    }
}

function calculateSHA1(data: crypto.BinaryLike): string {
    return crypto.createHash('sha1').update(data).digest('hex')
}