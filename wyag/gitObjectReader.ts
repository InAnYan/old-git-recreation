import { GitType } from "./gitType"
import { GitObject } from "./gitObject"
import { GitBlob } from "./objects/gitBlob"

export class GitObjectReader {
    static fromSerialized(buf: Buffer): GitObject {
        let space = buf.indexOf(' ')
        let nullByte = buf.indexOf('\0', space)

        let size = parseInt(buf.toString('ascii', space, nullByte))
        if (size != buf.length - nullByte - 1) {
            throw new Error(`Malformed object: bad length`)
        }

        let data = buf.subarray(nullByte + 1)

        let type = buf.toString('ascii', 0, space)
        switch (type) {
            case 'blob': return new GitBlob(Buffer.from(data))
            default:
                throw new Error(`Unknown type ${type}.`)
        }
    }

    static fromSource(buf: Buffer, type: GitType): GitObject {
        switch (type) {
            case 'blob': return GitBlob.fromSource(buf)
        }
    }
}