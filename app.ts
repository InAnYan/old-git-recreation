import { Command, Option } from 'commander'
import { GitRepository } from './wyag/gitRepository'
import { GitObjectReader } from './wyag/gitObjectReader'
import { Path } from './wyag/path'
import { GitObjectCompressed } from './wyag/gitObjectCompressed'
import { gitTypeStrings } from './wyag/gitType'

const program = new Command()

program
    .name('wyag')
    .description('A simple recreation of Git.')
    .version('0.0.1', '-v, --version', 'output the current version')

program.command('init')
    .description('Create new Git repository.')
    .argument('[path]', 'Where to create the repository.', '.')
    .action((path) => {
        GitRepository.createNew(new Path(path))
    })

program.command('cat-file')
    .description('Provide content of repository objects')
    .argument('<object>', 'Object to display.')
    .action((object) => {
        let repo = GitRepository.find()
        let obj = repo.retrieveObject(object)
        let data = obj.serializeOwnData() 
        console.log(data.toString())
    })

program.command('hash-object')
    .description('Calculate object hash and optionally create a blob from a file.')
    .argument('<file>', 'Read object from <file>.')
    .option('-w, --write', 'Actually write the object into the database.')
    .addOption(new Option('-t, --type <type>', 'Specify the type').choices(gitTypeStrings))
    .action((filePath, options) => {
        let file = new Path(filePath).readFile()
        let obj = GitObjectReader.fromSource(file, options.type)
        let objFile = new GitObjectCompressed(obj)
        console.log(objFile.sha)

        if (options.write) {
            GitRepository.find().storeCompressedObject(objFile)
        }
    })

program.parse()