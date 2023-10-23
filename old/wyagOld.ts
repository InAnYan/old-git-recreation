import * as fs from 'fs'
import { ConfigIniParser } from 'config-ini-parser'
import * as zlib from 'zlib'
import * as crypto from 'crypto'

const repositoryDefaultConfig = new ConfigIniParser()
repositoryDefaultConfig.addSection('core')
repositoryDefaultConfig.set('core', 'repositoryformatversion', '0')
repositoryDefaultConfig.set('core', 'filemode', 'false')
repositoryDefaultConfig.set('core', 'bare', 'false')

class GitRepository {
    workTree: string
    gitDir: string
    conf: unknown

    constructor(path: string, force: boolean = false) {
        this.workTree = path
        this.gitDir = path + '/.git'

        if (!force && !isDirectoryExists(this.gitDir)) {
            throw new Error('Not a Git repository: ' + this.gitDir)
        }
    }

    repoPath(...path: string[]): string {
        return this.gitDir + '/' + path.join('/')
    }

    repoDir(mkdir: boolean, ...dirPath: string[]): string {
        let path = this.repoPath(...dirPath)

        if (isPathExists(path) && !isDirectory(path)) {
            throw new Error('Not a directory ' + path)
        }

        if (mkdir) {
            makeDirectories(path)
        }

        return path;
    }

    repoFile(mkdir: boolean, ...path: string[]): string {
        this.repoDir(mkdir, ...path.slice(0, -1))
        return this.repoPath(...path)
    }
}

export function createRepository(path: string): GitRepository {
    let repo = new GitRepository(path, true)

    if (isPathExists(repo.workTree)) {
        if (!isDirectory(repo.workTree)) {
            throw new Error('Not a directory ' + repo.workTree)
        }

        if (isPathExists(repo.gitDir) && !isDirectoryEmpty(path)) {
            throw new Error(repo.gitDir + ' is not empty!')
        }
    } else {
        makeDirectories(path)
    }

    repo.repoDir(true, 'branches')
    repo.repoDir(true, 'objects')
    repo.repoDir(true, 'refs', 'tags')
    repo.repoDir(true, 'refs', 'heads')

    fs.writeFileSync(repo.repoFile(false, 'description'), 
                     "Unnamed repository; edit this file 'description' to name the repository.\n")

    fs.writeFileSync(repo.repoFile(false, 'HEAD'), 'ref: refs/heads/master\n')

    fs.writeFileSync(repo.repoFile(false, 'config'), repositoryDefaultConfig.stringify())

    return repo
}

function findRepository(path: string = '.'): GitRepository {
    let realPath = fs.realpathSync(path)

    if (isDirectoryExists(realPath + '/.git')) {
        return new GitRepository(path)
    }

    let parentPath = fs.realpathSync(realPath + '/..')

    if (realPath == parentPath) {
        throw new Error('No git directory.')
    }

    return findRepository(parentPath)
}

interface GitObject {
    serialize(): string
    getTypeString(): string
}

export const gitTypes = ['blob', 'tree', 'commit', 'tag']

class GitBlob implements GitObject {
    blobData: string

    constructor(data: string) {
        this.blobData = data
    }

    serialize(): string {
        return this.blobData
    }

    getTypeString(): string {
        return 'blob'
    }
}

function readObject(repo: GitRepository, sha: string): GitObject {
    let path = repo.repoFile(false, 'objects', sha.slice(0, 2), sha.slice(2))

    if (!isPathExists(path) || !isFile(path)) {
        throw new Error(`Wrong path ${path}`)
    }

    let file = fs.readFileSync(path)
    file = zlib.unzipSync(file)

    let space = file.indexOf(' ')
    let nullByte = file.indexOf('\0', space)

    let size = parseInt(file.toString('ascii', space, nullByte))
    console.log(`Object: ${file}`)
    console.log(`Object size: ${size}`)
    if (size != file.length - nullByte - 1) {
        throw new Error(`Malformed object ${sha}: bad length`)
    }

    let data = file.toString('ascii', nullByte + 1)

    let type = file.toString('ascii', 0, space)
    switch (type) {
        case 'blob': return new GitBlob(data)
        default:
            throw new Error(`Unknown type ${type} for object ${sha}`)
    }
}

function writeObject(obj: GitObject, repo?: GitRepository): string {
    let data = obj.serialize();

    let header = obj.getTypeString() + ' ' + data.length.toString() + '\0';
    console.log(`Buffer header: ${header}`)

    let result = header + data

    let sha = calculateSHA1(result)

    if (repo) {
        let path = repo.repoFile(true, 'objects', sha.slice(0, 2), sha.slice(2))

        if (!isPathExists(path)) {
            fs.writeFileSync(path, zlib.gzipSync(result))
        }
    }

    return sha
}

function calculateSHA1(str: string | Buffer): string {
    return crypto.createHash('sha1').update(str).digest('hex')
}

export function catFile(type: string, name: string) {
    let repo = findRepository()
    let obj = readObject(repo, findObject(repo, type, name))
    console.log(obj.serialize())
}

function findObject(repo: GitRepository, type: string, name: string) {
    return name
}

export function hashObject(path: string, type: string, write: boolean) {
    let repo = write ? findRepository() : undefined

    let data = fs.readFileSync(path).toString()

    let obj: GitObject;

    switch (type) {
        case 'blob': obj = new GitBlob(data); break;
        default: throw new Error(`Unknown type ${type}`)
    }

    console.log(writeObject(obj, repo))
}