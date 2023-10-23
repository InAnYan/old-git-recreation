import { ConfigIniParser } from 'config-ini-parser'

export const repositoryDefaultConfig = new ConfigIniParser()
repositoryDefaultConfig.addSection('core')
repositoryDefaultConfig.set('core', 'repositoryformatversion', '0')
repositoryDefaultConfig.set('core', 'filemode', 'false')
repositoryDefaultConfig.set('core', 'bare', 'false')
