import * as fs from 'fs'

export class Path {
    str: string

    constructor(str: string) {
        this.str = str
    }

    toString(): string {
        return this.str
    }

    equalTo(other: Path): boolean {
        return this.str == other.str
    }

    isExists(): boolean {
        return fs.existsSync(this.str)
    }

    /// Check that the path exists!
    isDirectory(): boolean {
        return fs.lstatSync(this.str).isDirectory()
    }

    /// Check that the path exists!
    isFile(): boolean {
        return fs.lstatSync(this.str).isFile()
    }

    /// Should I check before that this directory exists?
    isDirectoryEmpty(): boolean {
        return fs.readdirSync(this.str).length == 0
    }

    /// Creates new path.
    getRealPath(): Path {
        return new Path(fs.realpathSync(this.str))
    }

    /// Creates new path.
    append(...str: string[]): Path {
        return new Path(this.toString() + '/' + str.join('/'))
    }

    /// Creates new path.
    appendPath(path: Path): Path {
        if (this.isRootPath()) {
            throw new Error('Appending root path is prohibited.')
        }

        return new Path(this.str + '/' + path.toString())
    }

    /// Creates new path.
    prepend(str: string): Path {
        if (this.isRootPath()) {
            throw new Error('Prepending to root path is prohibited.')
        }

        return new Path(str + '/' + this.toString())
    }

    /// Creates new path.
    getParentPath(): Path {
        return this.append('..').getRealPath()
    }

    isRootPath(): boolean {
        return this.str.length != 0 && this.str[0] == '/'
    }

    readFile(): Buffer {
        return fs.readFileSync(this.toString())
    }

    writeFile(buf: Buffer | string) {
        fs.writeFileSync(this.toString(), buf)
    }

    /// Note: the function treats the last path argument as a directory, but not a file.
    makeDirectories() {
        if (!this.isExists()) {
            fs.mkdirSync(this.toString(), { recursive: true })
        }
    }
}