import {Argument, Command, Option} from 'commander'
import * as wyag from './wyag'

const program = new Command()

program
    .name('wyag')
    .description('A simple recreation of Git.')
    .version('0.0.1', '-v, --version', 'output the current version')

program.command('init')
    .description('Create new Git repository.')
    .argument('[path]', 'Where to create the repository.', '.')
    .action((path) => {
        wyag.createRepository(path)
    })

program.command('cat-file')
    .description('Provide content of repository objects')
    .addArgument(new Argument('<type>', 'Specify the type.').choices(wyag.gitTypes))
    .argument('<object>', 'Object to display.')
    .action((type, object) => {
        wyag.catFile(type, object)
    })

program.command('hash-object')
    .description('Calculate object hash and optionally create a blob from a file.')
    .argument('<file>', 'Read object from <file>.')
    .option('-w, --write', 'Actually write the object into the database.')
    .addOption(new Option('-t, --type <type>', 'Specify the type').choices(wyag.gitTypes))
    .action((file, options) => {
        wyag.hashObject(file, options.type, options.write)
    })

program.parse()