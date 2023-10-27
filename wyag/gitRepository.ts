import { Path } from './path'
import { GitObject } from './gitObject'
import { GitObjectCompressed } from './gitObjectCompressed'
import { repositoryDefaultConfig } from './repositoryDefaultConfig'

export class GitRepository {
    workTree: Path

    static createNew(path: Path): GitRepository {
        if (GitRepository.isWorkDir(path)) {
            throw new Error('Git repository already exists.')
        }

        let gitDir = path.append('.git')
        gitDir.append('objects').makeDirectories()
        gitDir.append('branches').makeDirectories()
        gitDir.append('refs', 'tags').makeDirectories()
        gitDir.append('refs', 'heads').makeDirectories()

        gitDir.append('description').writeFile("Unnamed repository; edit this file 'description' to name the repository.\n")

        gitDir.append('HEAD').writeFile('ref: refs/heads/master\n')

        gitDir.append('config').writeFile(repositoryDefaultConfig.stringify())

        return new GitRepository(path)
    }

    static find(path: Path = new Path('.')): GitRepository {
        let realPath = path.getRealPath()

        if (GitRepository.isWorkDir(realPath)) {
            return new GitRepository(path)
        }

        let parentPath = realPath.getParentPath()

        if (realPath.equalTo(parentPath)) {
            throw new Error('No git directory.')
        }

        return GitRepository.find(parentPath)
    }

    constructor(path: Path) {
        this.workTree = path
    }
    
    retrieveObject(sha: string): GitObject {
        let path = this.makeGitPath('objects', sha.slice(0, 2), sha.slice(2))
        let file = path.readFile()
        return GitObjectCompressed.fromBufferToObject(file)
    }

    storeObject(obj: GitObject) {
        this.storeCompressedObject(new GitObjectCompressed(obj))
    }

    storeCompressedObject(objFile: GitObjectCompressed) {
        let objDirPath = this.makeGitPath('objects', objFile.sha.slice(0, 2))
        objDirPath.makeDirectories()

        let path = objDirPath.append(objFile.sha.slice(2))
        path.writeFile(objFile.compressed)
    }

    makeGitPath(...strs: string[]): Path {
        return this.gitDir().append(...strs)
    }

    toGitPath(path: Path) {
        return this.gitDir().appendPath(path)
    }

    gitDir(): Path {
        return this.workTree.append('.git')
    }

    static isWorkDir(path: Path): boolean {
        let gitPath = path.append('.git')
        return gitPath.isExists() && gitPath.isDirectory()
    }
}
