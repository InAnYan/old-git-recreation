type KvlmMap = Map<string, string[] | string>

export class Kvlm {
    dict: KvlmMap
    message: string

    constructor(dict: KvlmMap, message: string) {
        this.dict = dict
        this.message = message
    }

    serialize(): string {
        let res = ''

        for (let key in this.dict) {

        }
    }

    static parse(buf: Buffer, start: number = 0, dict: KvlmMap = new Map<string, string[] | string>()): Kvlm {
        let space = buf.indexOf(' ', start)
        let newLine = buf.indexOf('\n', start)

        if (space < 0 || newLine < space) {
            if (newLine != start) {
                throw new Error('Some error happend while parsing kvlm.')
            }

            return new Kvlm(dict, buf.toString('ascii', start + 1))
        }

        let key = buf.toString('ascii', start, space)

        let end = start
        while (true) {
            end = buf.indexOf('\n', end + 1)
            if (buf[end + 1] != ' '.charCodeAt(0)) {
                break;
            }
        }

        let value = buf.toString('ascii', space + 1, end)

        let dictVal = dict.get(key)

        if (typeof dictVal == 'undefined') {
            dict.set(key, value)
        } else if (Array.isArray(dictVal)) {
            dictVal.push(value)
        } else {
            dict.set(key, [dictVal, value])
        }

        return Kvlm.parse(buf, end + 1, dict)
    }
}